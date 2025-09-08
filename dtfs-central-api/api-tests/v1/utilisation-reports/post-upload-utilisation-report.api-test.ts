import { HttpStatusCode } from 'axios';
import { WithoutId } from 'mongodb';
import {
  AzureFileInfoEntity,
  FeeRecordEntity,
  MOCK_AZURE_FILE_INFO,
  MONGO_DB_COLLECTIONS,
  PENDING_RECONCILIATION,
  REPORT_NOT_RECEIVED,
  TfmFacility,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
  UtilisationReportRawCsvData,
  UtilisationReportStatus,
} from '@ukef/dtfs2-common';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { mongoDbClient } from '../../../server/drivers/db-client';
import { wipe } from '../../wipeDB';
import { aUtilisationReportRawCsvData, aPortalUser, aFacility, aBank, aTfmFacility } from '../../../test-helpers';
import { PostUploadUtilisationReportRequestBody } from '../../../server/v1/controllers/utilisation-report-service/post-upload-utilisation-report.controller';

console.error = jest.fn();

const getUrl = () => '/v1/utilisation-reports';

describe(`POST ${getUrl()}`, () => {
  const reportId = 12;
  const facilityId = '123456789';

  const portalUser = aPortalUser();
  const portalUserId = portalUser._id.toString();

  const aValidPayload = (): PostUploadUtilisationReportRequestBody => ({
    reportId,
    fileInfo: MOCK_AZURE_FILE_INFO,
    reportData: [{ ...aUtilisationReportRawCsvData(), 'ukef facility id': facilityId }],
    user: { _id: portalUserId },
  });

  const aNotReceivedReport = () => UtilisationReportEntityMockBuilder.forStatus(REPORT_NOT_RECEIVED).withId(reportId).build();

  const insertTfmFacilitiesForFacilityIds = async (ukefFacilityIds: string[]): Promise<void> => {
    const tfmFacilities: WithoutId<TfmFacility>[] = ukefFacilityIds.map((ukefFacilityId) => ({
      ...aTfmFacility(),
      facilitySnapshot: {
        ...aFacility(),
        ukefFacilityId,
      },
    }));

    const tfmFacilitiesCollection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    await tfmFacilitiesCollection.insertMany(tfmFacilities);
  };

  const bankToInsert = {
    ...aBank(),
    id: aNotReceivedReport().bankId,
    utilisationReportPeriodSchedule: [
      { startMonth: 1, endMonth: 3 },
      { startMonth: 4, endMonth: 6 },
      { startMonth: 7, endMonth: 9 },
      { startMonth: 10, endMonth: 12 },
    ],
  };

  beforeAll(async () => {
    await wipe([MONGO_DB_COLLECTIONS.USERS]);
    const usersCollection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.USERS);
    await usersCollection.insertOne(portalUser);
  });

  beforeEach(async () => {
    await wipe([MONGO_DB_COLLECTIONS.TFM_FACILITIES, MONGO_DB_COLLECTIONS.BANKS]);
    await SqlDbHelper.deleteAll();

    await SqlDbHelper.saveNewEntry('UtilisationReport', aNotReceivedReport());

    const tfmFacilitiesCollection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
    await tfmFacilitiesCollection.insertOne({ ...aTfmFacility(), facilitySnapshot: { ...aFacility(), ukefFacilityId: facilityId } });

    const banksCollection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.BANKS);
    await banksCollection.insertOne(bankToInsert);
  });

  afterAll(async () => {
    await wipe([MONGO_DB_COLLECTIONS.USERS, MONGO_DB_COLLECTIONS.TFM_FACILITIES, MONGO_DB_COLLECTIONS.BANKS]);
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

  it(`responds with a 201 (Created) with a valid payload and sets the report status to ${PENDING_RECONCILIATION}`, async () => {
    // Act
    const response = await testApi.post(aValidPayload()).to(getUrl());

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Created);

    const report = await SqlDbHelper.manager.findOneByOrFail(UtilisationReportEntity, { id: reportId });
    expect(report.status).toBe<UtilisationReportStatus>(PENDING_RECONCILIATION);
  });

  it('creates as many fee records as there are rows in the reportData field', async () => {
    // Arrange
    const reportData: UtilisationReportRawCsvData[] = [
      { ...aUtilisationReportRawCsvData(), 'ukef facility id': facilityId },
      { ...aUtilisationReportRawCsvData(), 'ukef facility id': facilityId },
      { ...aUtilisationReportRawCsvData(), 'ukef facility id': facilityId },
    ];

    const payload: PostUploadUtilisationReportRequestBody = { ...aValidPayload(), reportData };

    // Act
    const response = await testApi.post(payload).to(getUrl());

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Created);

    const feeRecordCount = await SqlDbHelper.manager.count(FeeRecordEntity, {});
    expect(feeRecordCount).toEqual(3);
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

    const reportData: UtilisationReportRawCsvData[] = ukefFacilityIds.map((id) => ({
      ...aUtilisationReportRawCsvData(),
      'ukef facility id': id,
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
  });
});
