import { HttpStatusCode } from 'axios';
import { IsNull, Not } from 'typeorm';
import { FeeRecordEntity, FeeRecordEntityMockBuilder, FeeRecordStatus, UtilisationReportEntity, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { wipe } from '../../wipeDB';
import { aPortalUser, aTfmUser, aTfmSessionUser } from '../../../test-helpers/test-data';

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

  it('returns a 200 with a valid request body when there are fee records at the MATCH status', async () => {
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

  describe('when there are multiple fee records with the same facility id', () => {
    const facilityId = '12345678';

    const getReadyToKeyFeeRecordsWithNonNullKeyingData = async (): Promise<FeeRecordEntity[]> =>
      await SqlDbHelper.manager.find(FeeRecordEntity, {
        where: {
          status: 'READY_TO_KEY',
          fixedFeeAdjustment: Not(IsNull()),
          premiumAccrualBalanceAdjustment: Not(IsNull()),
          principalBalanceAdjustment: Not(IsNull()),
        },
      });

    const getReadyToKeyFeeRecordsWithNullKeyingData = async (): Promise<FeeRecordEntity[]> =>
      await SqlDbHelper.manager.find(FeeRecordEntity, {
        where: {
          status: 'READY_TO_KEY',
          fixedFeeAdjustment: IsNull(),
          premiumAccrualBalanceAdjustment: IsNull(),
          principalBalanceAdjustment: IsNull(),
        },
      });

    it('generates keying data only for one of the fee records at MATCH status', async () => {
      // Arrange
      const report = anUploadedUtilisationReport();

      const feeRecordsAtMatchStatus = [
        FeeRecordEntityMockBuilder.forReport(report).withId(1).withFacilityId(facilityId).withStatus('MATCH').build(),
        FeeRecordEntityMockBuilder.forReport(report).withId(2).withFacilityId(facilityId).withStatus('MATCH').build(),
        FeeRecordEntityMockBuilder.forReport(report).withId(3).withFacilityId(facilityId).withStatus('MATCH').build(),
      ];
      report.feeRecords = feeRecordsAtMatchStatus;

      await SqlDbHelper.saveNewEntry('UtilisationReport', report);

      // Act
      const response1 = await testApi.post(aValidRequestBody()).to(getUrl(reportId));

      // Assert
      expect(response1.status).toBe(HttpStatusCode.Ok);
      expect(await getReadyToKeyFeeRecordsWithNullKeyingData()).toHaveLength(2);
      expect(await getReadyToKeyFeeRecordsWithNonNullKeyingData()).toHaveLength(1);
    });

    it('only generates keying data once all the fee records are at the MATCH status', async () => {
      // Arrange 1
      const report = anUploadedUtilisationReport();

      const toDoFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(1).withFacilityId(facilityId).withStatus('TO_DO').build();

      const feeRecordsAtMatchStatus = [
        FeeRecordEntityMockBuilder.forReport(report).withId(2).withFacilityId(facilityId).withStatus('MATCH').build(),
        FeeRecordEntityMockBuilder.forReport(report).withId(3).withFacilityId(facilityId).withStatus('MATCH').build(),
      ];

      const allFeeRecords = [toDoFeeRecord, ...feeRecordsAtMatchStatus];

      report.feeRecords = allFeeRecords;
      await SqlDbHelper.saveNewEntry('UtilisationReport', report);

      // Act 1
      const response1 = await testApi.post(aValidRequestBody()).to(getUrl(reportId));

      // Assert 1
      expect(response1.status).toBe(HttpStatusCode.Ok);
      expect(await getReadyToKeyFeeRecordsWithNullKeyingData()).toHaveLength(2);
      expect(await getReadyToKeyFeeRecordsWithNonNullKeyingData()).toHaveLength(0);

      // Arrange 2
      const existingToDoFeeRecord = await SqlDbHelper.manager.findOneByOrFail(FeeRecordEntity, { status: 'TO_DO' });
      existingToDoFeeRecord.status = 'MATCH';
      await SqlDbHelper.saveNewEntry('FeeRecord', existingToDoFeeRecord);

      // Act 2
      const response2 = await testApi.post(aValidRequestBody()).to(getUrl(reportId));

      // Assert 2
      expect(response2.status).toBe(HttpStatusCode.Ok);
      expect(await getReadyToKeyFeeRecordsWithNullKeyingData()).toHaveLength(2);
      const feeRecordWithKeyingData = await getReadyToKeyFeeRecordsWithNonNullKeyingData();
      expect(feeRecordWithKeyingData).toHaveLength(1);
      expect(feeRecordWithKeyingData[0].id).toBe(1);
    });
  });
});
