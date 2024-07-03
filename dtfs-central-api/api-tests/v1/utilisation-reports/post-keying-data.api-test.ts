import { HttpStatusCode } from 'axios';
import { In } from 'typeorm';
import { FeeRecordEntity, FeeRecordEntityMockBuilder, FeeRecordStatus, UtilisationReportEntity, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { wipe } from '../../wipeDB';
import { aPortalUser } from '../../../test-helpers/test-data/portal-user';
import { aTfmUser } from '../../../test-helpers/test-data/tfm-user';
import { aTfmSessionUser } from '../../../test-helpers/test-data/tfm-session-user';

console.error = jest.fn();

describe('POST /v1/utilisation-reports/:reportId/keying-data', () => {
  const getUrl = (reportId: number | string) => `/v1/utilisation-reports/${reportId}/keying-data`;

  const reportId = 1;

  const portalUser = aPortalUser();
  const portalUserId = portalUser._id.toString();

  const tfmUser = aTfmUser();
  const tfmUserId = tfmUser._id.toString();

  const anUploadedUtilisationReport = () =>
    UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(reportId).withUploadedByUserId(portalUserId).build();

  const aValidRequestBody = () => ({
    user: {
      ...aTfmSessionUser(),
      _id: tfmUserId,
    },
  });

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    await wipe(['users', 'tfm-users']);

    const usersCollection = await mongoDbClient.getCollection('users');
    await usersCollection.insertOne(portalUser);

    const tfmUsersCollection = await mongoDbClient.getCollection('tfm-users');
    await tfmUsersCollection.insertOne(tfmUser);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await wipe(['users', 'tfm-users']);
  });

  it('returns a 400 when the report id is not a valid id', async () => {
    // Arrange
    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl('invalid-id'));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it("returns a 400 when the payload 'user' is an empty object", async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      user: {},
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it('returns a 404 when there are no fee records at the MATCH state attached to the report with the supplied id', async () => {
    // Arrange
    const report = anUploadedUtilisationReport();
    const toDoFeeRecords = [
      FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus('TO_DO').build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus('TO_DO').build(),
    ];
    report.feeRecords = toDoFeeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    // Act
    const response = await testApi.post(aValidRequestBody()).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.NotFound);
  });

  it('returns a 200 with a valid request body when there are matching fee records', async () => {
    // Arrange
    const report = anUploadedUtilisationReport();
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(report).withId(1).withFacilityId('11111111').withStatus('MATCH').build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withFacilityId('22222222').withStatus('MATCH').build(),
    ];
    report.feeRecords = feeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);
  });

  it('updates the utilisation report audit fields', async () => {
    // Arrange
    const report = anUploadedUtilisationReport();
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus('MATCH').build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus('MATCH').build(),
    ];
    report.feeRecords = feeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);

    const updatedReport = await SqlDbHelper.manager.findOneByOrFail(UtilisationReportEntity, { id: reportId });
    expect(updatedReport.lastUpdatedByIsSystemUser).toBe(false);
    expect(updatedReport.lastUpdatedByPortalUserId).toBeNull();
    expect(updatedReport.lastUpdatedByTfmUserId).toBe(tfmUserId);
  });

  it('updates each of the MATCH fee record audit fields and does not update the non MATCH fee record audit fields', async () => {
    // Arrange
    const report = anUploadedUtilisationReport();
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(report)
        .withId(1)
        .withStatus('TO_DO')
        .withLastUpdatedByPortalUserId(portalUserId)
        .withLastUpdatedByTfmUserId(null)
        .withLastUpdatedByIsSystemUser(false)
        .build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus('MATCH').build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(3).withStatus('MATCH').build(),
    ];
    report.feeRecords = feeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);

    const [notUpdatedFeeRecords, ...updatedFeeRecords] = await Promise.all([
      SqlDbHelper.manager.findOneByOrFail(FeeRecordEntity, { id: 1 }),
      SqlDbHelper.manager.findOneByOrFail(FeeRecordEntity, { id: 2 }),
      SqlDbHelper.manager.findOneByOrFail(FeeRecordEntity, { id: 3 }),
    ]);

    expect(notUpdatedFeeRecords.lastUpdatedByIsSystemUser).toBe(false);
    expect(notUpdatedFeeRecords.lastUpdatedByPortalUserId).toBe(portalUserId);
    expect(notUpdatedFeeRecords.lastUpdatedByTfmUserId).toBeNull();

    updatedFeeRecords.forEach((feeRecord) => {
      expect(feeRecord.lastUpdatedByIsSystemUser).toBe(false);
      expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
      expect(feeRecord.lastUpdatedByTfmUserId).toBe(tfmUserId);
    });
  });

  it('only sets the keying sheet fields for fee records where all fee records with the same facility id are at the MATCH state', async () => {
    // Arrange
    const report = anUploadedUtilisationReport();
    const feeRecords = [
      // Fee records for same facility where only one has MATCH status
      FeeRecordEntityMockBuilder.forReport(report).withId(1).withFacilityId('111111111').withStatus('TO_DO').build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withFacilityId('111111111').withStatus('MATCH').build(),
      // Fee records for same facility where both have MATCH status
      FeeRecordEntityMockBuilder.forReport(report).withId(3).withFacilityId('222222222').withStatus('MATCH').build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(4).withFacilityId('222222222').withStatus('MATCH').build(),
    ];
    report.feeRecords = feeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);

    const feeRecordWithoutKeyingData = await SqlDbHelper.manager.findOneByOrFail(FeeRecordEntity, { id: 2 });
    expect(feeRecordWithoutKeyingData.fixedFeeAdjustment).toBeNull();
    expect(feeRecordWithoutKeyingData.premiumAccrualBalanceAdjustment).toBeNull();
    expect(feeRecordWithoutKeyingData.principalBalanceAdjustment).toBeNull();

    const feeRecordsWithKeyingData = await SqlDbHelper.manager.findBy(FeeRecordEntity, { id: In([3, 4]) });
    feeRecordsWithKeyingData.forEach((feeRecord) => {
      expect(feeRecord.fixedFeeAdjustment).not.toBeNull();
      expect(feeRecord.premiumAccrualBalanceAdjustment).not.toBeNull();
      expect(feeRecord.principalBalanceAdjustment).not.toBeNull();
    });
  });

  it('updates the status of all MATCH fee records to READY_TO_KEY', async () => {
    // Arrange
    const report = anUploadedUtilisationReport();
    const feeRecords = [
      // Fee records for same facility where only one has MATCH status
      FeeRecordEntityMockBuilder.forReport(report).withId(1).withFacilityId('111111111').withStatus('TO_DO').build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withFacilityId('111111111').withStatus('MATCH').build(),
      // Fee records for same facility where both have MATCH status
      FeeRecordEntityMockBuilder.forReport(report).withId(3).withFacilityId('222222222').withStatus('MATCH').build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(4).withFacilityId('222222222').withStatus('MATCH').build(),
    ];
    report.feeRecords = feeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);

    const allFeeRecords = await SqlDbHelper.manager.find(FeeRecordEntity, {});
    expect(allFeeRecords).toHaveLength(feeRecords.length);
    expect(allFeeRecords.find(({ id }) => id === 1)!.status).toBe<FeeRecordStatus>('TO_DO');
    expect(allFeeRecords.find(({ id }) => id === 2)!.status).toBe<FeeRecordStatus>('READY_TO_KEY');
    expect(allFeeRecords.find(({ id }) => id === 3)!.status).toBe<FeeRecordStatus>('READY_TO_KEY');
    expect(allFeeRecords.find(({ id }) => id === 4)!.status).toBe<FeeRecordStatus>('READY_TO_KEY');
  });

  it('sets the keying sheet values only once all attached fee records are either at the MATCH or READY_TO_KEY status', async () => {
    // Arrange 1
    const report = anUploadedUtilisationReport();

    const toDoFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(1).withFacilityId('11111111').withStatus('TO_DO').build();

    const matchingFeeRecords = [
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withFacilityId('11111111').withStatus('MATCH').build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(3).withFacilityId('11111111').withStatus('MATCH').build(),
    ];

    const allFeeRecords = [toDoFeeRecord, ...matchingFeeRecords];

    report.feeRecords = allFeeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = aValidRequestBody();

    // Act 1
    const response1 = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert 1
    expect(response1.status).toBe(HttpStatusCode.Ok);

    const readyToKeyFeeRecords1 = await SqlDbHelper.manager.findBy(FeeRecordEntity, { status: 'READY_TO_KEY' });
    expect(readyToKeyFeeRecords1).toHaveLength(matchingFeeRecords.length);
    readyToKeyFeeRecords1.forEach((feeRecord) => {
      expect(feeRecord.fixedFeeAdjustment).toBeNull();
      expect(feeRecord.premiumAccrualBalanceAdjustment).toBeNull();
      expect(feeRecord.principalBalanceAdjustment).toBeNull();
    });

    // Arrange 2
    const existingToDoFeeRecord = await SqlDbHelper.manager.findOneByOrFail(FeeRecordEntity, { status: 'TO_DO' });
    existingToDoFeeRecord.status = 'MATCH';
    await SqlDbHelper.saveNewEntry('FeeRecord', existingToDoFeeRecord);

    // Act 2
    const response2 = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response2.status).toBe(HttpStatusCode.Ok);

    const readyToKeyFeeRecords2 = await SqlDbHelper.manager.findBy(FeeRecordEntity, { status: 'READY_TO_KEY' });
    expect(readyToKeyFeeRecords2).toHaveLength(allFeeRecords.length);
    readyToKeyFeeRecords2.forEach((feeRecord) => {
      expect(feeRecord.fixedFeeAdjustment).not.toBeNull();
      expect(feeRecord.premiumAccrualBalanceAdjustment).not.toBeNull();
      expect(feeRecord.principalBalanceAdjustment).not.toBeNull();
    });
  });
});
