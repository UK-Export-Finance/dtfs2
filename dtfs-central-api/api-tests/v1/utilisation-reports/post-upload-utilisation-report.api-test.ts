import { HttpStatusCode } from 'axios';
import {
  AzureFileInfoEntity,
  FacilityUtilisationDataEntity,
  FacilityUtilisationDataEntityMockBuilder,
  FeeRecordEntity,
  MOCK_AZURE_FILE_INFO,
  ReportPeriod,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
  UtilisationReportRawCsvData,
  UtilisationReportReconciliationStatus,
} from '@ukef/dtfs2-common';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { wipe } from '../../wipeDB';
import { aUtilisationReportRawCsvData, aPortalUser } from '../../../test-helpers';
import { PostUploadUtilisationReportRequestBody } from '../../../src/v1/controllers/utilisation-report-service/post-upload-utilisation-report.controller';

console.error = jest.fn();

const getUrl = () => '/v1/utilisation-reports';

describe(`POST ${getUrl()}`, () => {
  const reportId = 12;

  const portalUser = aPortalUser();
  const portalUserId = portalUser._id.toString();

  const aValidPayload = (): PostUploadUtilisationReportRequestBody => ({
    reportId,
    fileInfo: MOCK_AZURE_FILE_INFO,
    reportData: [aUtilisationReportRawCsvData()],
    user: { _id: portalUserId },
  });

  const aNotReceivedReport = () => UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').withId(reportId).build();

  beforeAll(async () => {
    await wipe(['users']);
    const usersCollection = await mongoDbClient.getCollection('users');
    await usersCollection.insertOne(portalUser);
  });

  beforeEach(async () => {
    await SqlDbHelper.deleteAll();
    await SqlDbHelper.saveNewEntry('UtilisationReport', aNotReceivedReport());
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAll();
  });

  it('responds with a 404 (Not Found) when the report with the specified id does not exist', async () => {
    // Arrange
    const payload: PostUploadUtilisationReportRequestBody = { ...aValidPayload(), reportId: 999 };

    // Act
    const response = await testApi.post(payload).to(getUrl());

    // Assert
    expect(response.status).toBe(HttpStatusCode.NotFound);
  });

  it("responds with a 201 (Created) with a valid payload and sets the report status to 'PENDING_RECONCILIATION'", async () => {
    // Act
    const response = await testApi.post(aValidPayload()).to(getUrl());

    // Assert
    expect(response.status).toBe(HttpStatusCode.Created);

    const report = await SqlDbHelper.manager.findOneByOrFail(UtilisationReportEntity, { id: reportId });
    expect(report.status).toBe<UtilisationReportReconciliationStatus>('PENDING_RECONCILIATION');
  });

  it('creates as many fee records as there are rows in the reportData field', async () => {
    // Arrange
    const reportData: UtilisationReportRawCsvData[] = [
      { ...aUtilisationReportRawCsvData() },
      { ...aUtilisationReportRawCsvData() },
      { ...aUtilisationReportRawCsvData() },
    ];

    const payload: PostUploadUtilisationReportRequestBody = { ...aValidPayload(), reportData };

    // Act
    const response = await testApi.post(payload).to(getUrl());

    // Assert
    expect(response.status).toBe(HttpStatusCode.Created);

    const feeRecordCount = await SqlDbHelper.manager.count(FeeRecordEntity, {});
    expect(feeRecordCount).toBe(3);
  });

  it('creates an entry in the FacilityUtilisationData table for each facility id in the report csv data', async () => {
    // Arrange
    const facilityIds = ['11111111', '22222222', '33333333'];
    const reportData: UtilisationReportRawCsvData[] = facilityIds.map((facilityId) => ({
      ...aUtilisationReportRawCsvData(),
      'ukef facility id': facilityId,
    }));

    const payload: PostUploadUtilisationReportRequestBody = { ...aValidPayload(), reportData };

    // Act
    const response = await testApi.post(payload).to(getUrl());

    // Assert
    expect(response.status).toBe(HttpStatusCode.Created);

    const facilityIdExists = await Promise.all(
      facilityIds.map((facilityId) => SqlDbHelper.manager.existsBy(FacilityUtilisationDataEntity, { id: facilityId })),
    );
    expect(facilityIdExists).toEqual([true, true, true]);
  });

  it('creates an entry in the AzureFileInfo table', async () => {
    // Act
    const response = await testApi.post(aValidPayload()).to(getUrl());

    // Assert
    expect(response.status).toBe(HttpStatusCode.Created);

    const azureFileInfo = await SqlDbHelper.manager.find(AzureFileInfoEntity, {});
    expect(azureFileInfo).toHaveLength(1);
  });

  it('saves the report when there is a large number of fee records all for the same facility', async () => {
    // Arrange
    const numberOfReportDataEntriesToCreate = 500;

    const facilityId = '12345678';
    const reportData: UtilisationReportRawCsvData[] = [];
    while (reportData.length < numberOfReportDataEntriesToCreate) {
      reportData.push({ ...aUtilisationReportRawCsvData(), 'ukef facility id': facilityId });
    }

    const payload: PostUploadUtilisationReportRequestBody = { ...aValidPayload(), reportData };

    // Act
    const response = await testApi.post(payload).to(getUrl());

    // Assert
    expect(response.status).toBe(HttpStatusCode.Created);

    const numberOfInsertedFeeRecords = await SqlDbHelper.manager.count(FeeRecordEntity, {});
    expect(numberOfInsertedFeeRecords).toBe(numberOfReportDataEntriesToCreate);
  });

  it('saves the report when there is a large number of fee records and each fee record has a unique facility id which does not exist in the facility utilisation data table', async () => {
    // Arrange
    const numberOfReportDataEntriesToCreate = 500;

    let facilityId = 10000000;
    const reportData: UtilisationReportRawCsvData[] = [];
    while (reportData.length < numberOfReportDataEntriesToCreate) {
      reportData.push({ ...aUtilisationReportRawCsvData(), 'ukef facility id': facilityId.toString() });
      facilityId += 1;
    }

    const payload: PostUploadUtilisationReportRequestBody = { ...aValidPayload(), reportData };

    // Act
    const response = await testApi.post(payload).to(getUrl());

    // Assert
    expect(response.status).toBe(HttpStatusCode.Created);

    const numberOfInsertedFeeRecords = await SqlDbHelper.manager.count(FeeRecordEntity, {});
    expect(numberOfInsertedFeeRecords).toBe(numberOfReportDataEntriesToCreate);
  });

  it('creates a new FacilityUtilisationData row using the report reportPeriod if the report data has a facility id which does not already exist', async () => {
    // Arrange
    await SqlDbHelper.deleteAll();

    const reportPeriod: ReportPeriod = {
      start: { month: 4, year: 2023 },
      end: { month: 6, year: 2023 },
    };
    const report = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').withId(reportId).withReportPeriod(reportPeriod).build();
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const facilityId = '12345678';
    const reportData: UtilisationReportRawCsvData[] = [{ ...aUtilisationReportRawCsvData(), 'ukef facility id': facilityId }];

    const payload: PostUploadUtilisationReportRequestBody = { ...aValidPayload(), reportData };

    // Act
    const response = await testApi.post(payload).to(getUrl());

    // Assert
    expect(response.status).toBe(HttpStatusCode.Created);

    const facilityUtilisationDataEntityExists = await SqlDbHelper.manager.existsBy(FacilityUtilisationDataEntity, { id: facilityId, reportPeriod });
    expect(facilityUtilisationDataEntityExists).toBe(true);
  });

  it('does not update the existing FacilityUtilisationData row if the report data has a facility id which already exists', async () => {
    // Arrange
    await SqlDbHelper.deleteAll();

    const reportReportPeriod: ReportPeriod = {
      start: { month: 4, year: 2023 },
      end: { month: 6, year: 2023 },
    };
    const report = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').withId(reportId).withReportPeriod(reportReportPeriod).build();
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const facilityId = '12345678';
    const facilityUtilisationDataReportPeriod: ReportPeriod = {
      start: { month: 1, year: 2021 },
      end: { month: 2, year: 2022 },
    };
    const facilityUtilisationData = FacilityUtilisationDataEntityMockBuilder.forId(facilityId).withReportPeriod(facilityUtilisationDataReportPeriod).build();
    await SqlDbHelper.saveNewEntry('FacilityUtilisationData', facilityUtilisationData);

    const reportData: UtilisationReportRawCsvData[] = [{ ...aUtilisationReportRawCsvData(), 'ukef facility id': facilityId }];

    const payload: PostUploadUtilisationReportRequestBody = { ...aValidPayload(), reportData };

    // Act
    const response = await testApi.post(payload).to(getUrl());

    // Assert
    expect(response.status).toBe(HttpStatusCode.Created);

    const facilityUtilisationDataEntity = await SqlDbHelper.manager.findOneByOrFail(FacilityUtilisationDataEntity, { id: facilityId });
    expect(facilityUtilisationDataEntity.reportPeriod).not.toEqual(reportReportPeriod);
    expect(facilityUtilisationDataEntity.reportPeriod).toEqual(facilityUtilisationDataReportPeriod);
  });
});
