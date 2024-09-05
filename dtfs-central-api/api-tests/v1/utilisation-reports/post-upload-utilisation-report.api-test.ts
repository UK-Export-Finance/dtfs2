import { HttpStatusCode } from 'axios';
import { WithoutId } from 'mongodb';
import {
  AzureFileInfoEntity,
  FacilityUtilisationDataEntity,
  FacilityUtilisationDataEntityMockBuilder,
  FeeRecordEntity,
  MOCK_AZURE_FILE_INFO,
  MONGO_DB_COLLECTIONS,
  ReportPeriod,
  TfmFacility,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
  UtilisationReportRawCsvData,
  UtilisationReportReconciliationStatus,
} from '@ukef/dtfs2-common';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { wipe } from '../../wipeDB';
import { aUtilisationReportRawCsvData, aPortalUser, aFacility } from '../../../test-helpers';
import { PostUploadUtilisationReportRequestBody } from '../../../src/v1/controllers/utilisation-report-service/post-upload-utilisation-report.controller';

console.error = jest.fn();

const getUrl = () => '/v1/utilisation-reports';

describe(`POST ${getUrl()}`, () => {
  const REPORT_ID = 12;
  const FACILITY_ID = '123456789';

  const PORTAL_USER = aPortalUser();
  const PORTAL_USER_ID = PORTAL_USER._id.toString();

  const aValidPayload = (): PostUploadUtilisationReportRequestBody => ({
    reportId: REPORT_ID,
    fileInfo: MOCK_AZURE_FILE_INFO,
    reportData: [{ ...aUtilisationReportRawCsvData(), 'ukef facility id': FACILITY_ID }],
    user: { _id: PORTAL_USER_ID },
  });

  const aNotReceivedReport = () => UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').withId(REPORT_ID).build();

  const insertTfmFacilitiesForFacilityIds = async (ukefFacilityIds: string[]): Promise<void> => {
    const tfmFacilities: WithoutId<TfmFacility>[] = ukefFacilityIds.map((ukefFacilityId) => ({
      facilitySnapshot: {
        ...aFacility(),
        ukefFacilityId,
      },
    }));

    const tfmFacilitiesCollection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    await tfmFacilitiesCollection.insertMany(tfmFacilities);
  };

  beforeAll(async () => {
    await wipe([MONGO_DB_COLLECTIONS.USERS]);
    const usersCollection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.USERS);
    await usersCollection.insertOne(PORTAL_USER);
  });

  beforeEach(async () => {
    await wipe([MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
    await SqlDbHelper.deleteAll();

    await SqlDbHelper.saveNewEntry('UtilisationReport', aNotReceivedReport());

    const tfmFacilitiesCollection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    await tfmFacilitiesCollection.insertOne({ facilitySnapshot: { ...aFacility(), ukefFacilityId: FACILITY_ID } });
  });

  afterAll(async () => {
    await wipe([MONGO_DB_COLLECTIONS.USERS, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
    await SqlDbHelper.deleteAll();
  });

  it('responds with a 404 (Not Found) when the report with the specified id does not exist', async () => {
    // Arrange
    const payload: PostUploadUtilisationReportRequestBody = { ...aValidPayload(), reportId: 999 };

    // Act
    const response = await testApi.post(payload).to(getUrl());

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it("responds with a 201 (Created) with a valid payload and sets the report status to 'PENDING_RECONCILIATION'", async () => {
    // Act
    const response = await testApi.post(aValidPayload()).to(getUrl());

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Created);

    const report = await SqlDbHelper.manager.findOneByOrFail(UtilisationReportEntity, { id: REPORT_ID });
    expect(report.status).toBe<UtilisationReportReconciliationStatus>('PENDING_RECONCILIATION');
  });

  it('creates as many fee records as there are rows in the reportData field', async () => {
    // Arrange
    const reportData: UtilisationReportRawCsvData[] = [
      { ...aUtilisationReportRawCsvData(), 'ukef facility id': FACILITY_ID },
      { ...aUtilisationReportRawCsvData(), 'ukef facility id': FACILITY_ID },
      { ...aUtilisationReportRawCsvData(), 'ukef facility id': FACILITY_ID },
    ];

    const payload: PostUploadUtilisationReportRequestBody = { ...aValidPayload(), reportData };

    // Act
    const response = await testApi.post(payload).to(getUrl());

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Created);

    const feeRecordCount = await SqlDbHelper.manager.count(FeeRecordEntity, {});
    expect(feeRecordCount).toEqual(3);
  });

  it('creates an entry in the FacilityUtilisationData table for each facility id in the report csv data', async () => {
    // Arrange
    const facilityIds = ['11111111', '22222222', '33333333'];
    const reportData: UtilisationReportRawCsvData[] = facilityIds.map((facilityId) => ({
      ...aUtilisationReportRawCsvData(),
      'ukef facility id': facilityId,
    }));

    await insertTfmFacilitiesForFacilityIds(facilityIds);

    const payload: PostUploadUtilisationReportRequestBody = { ...aValidPayload(), reportData };

    // Act
    const response = await testApi.post(payload).to(getUrl());

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Created);

    const facilityIdExists = await Promise.all(
      facilityIds.map((facilityId) => SqlDbHelper.manager.existsBy(FacilityUtilisationDataEntity, { id: facilityId })),
    );
    expect(facilityIdExists).toEqual([true, true, true]);
  });

  it('creates an entry in the AzureFileInfo table', async () => {
    // Act
    const response = await testApi.post(aValidPayload()).to(getUrl());

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Created);

    const azureFileInfo = await SqlDbHelper.manager.find(AzureFileInfoEntity, {});
    expect(azureFileInfo).toHaveLength(1);
  });

  describe('when uploading a report with a large number of fee records each for a distinct facility', () => {
    let responseStatus: number | undefined;

    const numberOfReportDataEntriesToCreate = 500;

    let ukefFacilityId = 10000001;
    const ukefFacilityIds: string[] = [];
    while (ukefFacilityIds.length < numberOfReportDataEntriesToCreate) {
      ukefFacilityIds.push(ukefFacilityId.toString());
      ukefFacilityId += 1;
    }

    const reportData: UtilisationReportRawCsvData[] = ukefFacilityIds.map((facilityId) => ({
      ...aUtilisationReportRawCsvData(),
      'ukef facility id': facilityId,
    }));

    beforeEach(async () => {
      // Arrange
      await insertTfmFacilitiesForFacilityIds(ukefFacilityIds);

      const payload: PostUploadUtilisationReportRequestBody = { ...aValidPayload(), reportData };

      // Act
      const response = await testApi.post(payload).to(getUrl());
      responseStatus = response.status;
    });

    it(`responds with a '${HttpStatusCode.Created}'`, () => {
      // Assert
      expect(responseStatus).toEqual(HttpStatusCode.Created);
    });

    it('saves each individual fee record', async () => {
      // Assert
      const numberOfInsertedFeeRecords = await SqlDbHelper.manager.count(FeeRecordEntity, {});
      expect(numberOfInsertedFeeRecords).toEqual(numberOfReportDataEntriesToCreate);
    });

    it('saves each new individual facility utilisation data entity', async () => {
      // Assert
      for (const facilityId of ukefFacilityIds) {
        const facilityUtilisationDataExists = await SqlDbHelper.manager.existsBy(FacilityUtilisationDataEntity, { id: facilityId });
        expect(facilityUtilisationDataExists).toEqual(true);
      }
    });
  });

  it('creates a new FacilityUtilisationData row using the report reportPeriod if the report data has a facility id which does not already exist', async () => {
    // Arrange
    await SqlDbHelper.deleteAll();

    const reportPeriod: ReportPeriod = {
      start: { month: 4, year: 2023 },
      end: { month: 6, year: 2023 },
    };
    const report = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').withId(REPORT_ID).withReportPeriod(reportPeriod).build();
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const ukefFacilityId = '12345678';
    const reportData: UtilisationReportRawCsvData[] = [{ ...aUtilisationReportRawCsvData(), 'ukef facility id': ukefFacilityId }];

    await insertTfmFacilitiesForFacilityIds([ukefFacilityId]);

    const payload: PostUploadUtilisationReportRequestBody = { ...aValidPayload(), reportData };

    // Act
    const response = await testApi.post(payload).to(getUrl());

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Created);

    const facilityUtilisationDataEntityExists = await SqlDbHelper.manager.existsBy(FacilityUtilisationDataEntity, { id: ukefFacilityId, reportPeriod });
    expect(facilityUtilisationDataEntityExists).toEqual(true);
  });

  it('does not update the existing FacilityUtilisationData row if the report data has a facility id which already exists', async () => {
    // Arrange
    await SqlDbHelper.deleteAll();

    const reportReportPeriod: ReportPeriod = {
      start: { month: 4, year: 2023 },
      end: { month: 6, year: 2023 },
    };
    const report = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').withId(REPORT_ID).withReportPeriod(reportReportPeriod).build();
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const ukefFacilityId = '12345678';
    const facilityUtilisationDataReportPeriod: ReportPeriod = {
      start: { month: 1, year: 2021 },
      end: { month: 2, year: 2022 },
    };
    const facilityUtilisationData = FacilityUtilisationDataEntityMockBuilder.forId(ukefFacilityId)
      .withReportPeriod(facilityUtilisationDataReportPeriod)
      .build();
    await SqlDbHelper.saveNewEntry('FacilityUtilisationData', facilityUtilisationData);

    await insertTfmFacilitiesForFacilityIds([ukefFacilityId]);

    const reportData: UtilisationReportRawCsvData[] = [{ ...aUtilisationReportRawCsvData(), 'ukef facility id': ukefFacilityId }];

    const payload: PostUploadUtilisationReportRequestBody = { ...aValidPayload(), reportData };

    // Act
    const response = await testApi.post(payload).to(getUrl());

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Created);

    const facilityUtilisationDataEntity = await SqlDbHelper.manager.findOneByOrFail(FacilityUtilisationDataEntity, { id: ukefFacilityId });
    expect(facilityUtilisationDataEntity.reportPeriod).not.toEqual(reportReportPeriod);
    expect(facilityUtilisationDataEntity.reportPeriod).toEqual(facilityUtilisationDataReportPeriod);
  });
});
