import { HttpStatusCode } from 'axios';
import {
  AzureFileInfoEntity,
  FacilityUtilisationDataEntity,
  FeeRecordEntity,
  MOCK_AZURE_FILE_INFO,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
  UtilisationReportRawCsvData,
  UtilisationReportReconciliationStatus,
} from '@ukef/dtfs2-common';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { wipe } from '../../wipeDB';
import { aUtilisationReportRawCsvData, aPortalUser } from '../../../test-helpers/test-data';
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
});
