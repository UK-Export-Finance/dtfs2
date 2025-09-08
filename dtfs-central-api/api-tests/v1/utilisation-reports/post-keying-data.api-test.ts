import { HttpStatusCode } from 'axios';
import {
  FEE_RECORD_STATUS,
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  FeeRecordPaymentJoinTableEntity,
  FeeRecordStatus,
  PaymentEntityMockBuilder,
  PENDING_RECONCILIATION,
  RECONCILIATION_IN_PROGRESS,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
  UtilisationReportStatus,
  withSqlIdPathParameterValidationTests,
} from '@ukef/dtfs2-common';
import { aTfmUser } from '@ukef/dtfs2-common/mock-data-backend';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { mongoDbClient } from '../../../server/drivers/db-client';
import { wipe } from '../../wipeDB';
import { aPortalUser, aTfmSessionUser } from '../../../test-helpers';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/keying-data';

describe(`POST ${BASE_URL}`, () => {
  const getUrl = (reportId: number | string) => BASE_URL.replace(':reportId', reportId.toString());

  const reportId = 1;

  const portalUser = aPortalUser();
  const portalUserId = portalUser._id.toString();

  const tfmUser = aTfmUser();
  const tfmUserId = tfmUser._id.toString();

  const anUploadedReconciliationInProgressUtilisationReport = () =>
    UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withId(reportId).withUploadedByUserId(portalUserId).build();
  const anUploadedPendingReconciliationUtilisationReport = () =>
    UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).withUploadedByUserId(portalUserId).build();

  const aValidRequestBody = () => ({
    user: {
      ...aTfmSessionUser(),
      _id: tfmUserId,
    },
  });

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAll();

    await wipe(['users', 'tfm-users']);

    const usersCollection = await mongoDbClient.getCollection('users');
    await usersCollection.insertOne(portalUser);

    const tfmUsersCollection = await mongoDbClient.getCollection('tfm-users');
    await tfmUsersCollection.insertOne(tfmUser);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAll();
  });

  afterAll(async () => {
    await wipe(['users', 'tfm-users']);
  });

  withSqlIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url: string) => testApi.post(aValidRequestBody()).to(url),
  });

  it("should return a 400 (Bad Request) when the payload 'user' is an empty object", async () => {
    // Arrange
    const requestBody = {
      ...aValidRequestBody(),
      user: {},
    };

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.BadRequest);
  });

  it('should return a 404 (Not Found) when there are no fee records at the MATCH state attached to the report with the supplied id', async () => {
    // Arrange
    const report = anUploadedReconciliationInProgressUtilisationReport();
    const toDoFeeRecords = [
      FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.TO_DO).build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus(FEE_RECORD_STATUS.TO_DO).build(),
    ];
    report.feeRecords = toDoFeeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    // Act
    const response = await testApi.post(aValidRequestBody()).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it('should return a 200 (Ok) when request has a valid body and there are fee records at the MATCH status', async () => {
    // Arrange
    const report = anUploadedReconciliationInProgressUtilisationReport();
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(report).withId(1).withFacilityId('11111111').withStatus(FEE_RECORD_STATUS.MATCH).build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withFacilityId('22222222').withStatus(FEE_RECORD_STATUS.MATCH).build(),
    ];
    report.feeRecords = feeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);
    await insertMatchingPaymentsForFeeRecords(feeRecords);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
  });

  it('should return a 200 when request has a valid body and the report is in state PENDING_RECONCILIATION with zero payment fee records at the MATCH status', async () => {
    // Arrange
    const report = anUploadedPendingReconciliationUtilisationReport();
    report.feeRecords = [FeeRecordEntityMockBuilder.forReport(report).withId(1).withPayments([]).withStatus(FEE_RECORD_STATUS.MATCH).build()];
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
  });

  it('should update report status to RECONCILIATION_IN_PROGRESS when request has a valid body and the report is in state PENDING_RECONCILIATION with zero payment fee records at the MATCH status', async () => {
    // Arrange
    const report = anUploadedPendingReconciliationUtilisationReport();
    report.feeRecords = [FeeRecordEntityMockBuilder.forReport(report).withId(1).withPayments([]).withStatus(FEE_RECORD_STATUS.MATCH).build()];
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody = aValidRequestBody();

    // Act
    await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    const updatedReport = await SqlDbHelper.manager.findOneByOrFail(UtilisationReportEntity, { id: reportId });
    expect(updatedReport.status).toBe<UtilisationReportStatus>(RECONCILIATION_IN_PROGRESS);
  });

  it('should update the utilisation report audit fields', async () => {
    // Arrange
    const report = anUploadedReconciliationInProgressUtilisationReport();
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.MATCH).build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus(FEE_RECORD_STATUS.MATCH).build(),
    ];
    report.feeRecords = feeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);
    await insertMatchingPaymentsForFeeRecords(feeRecords);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);

    const updatedReport = await SqlDbHelper.manager.findOneByOrFail(UtilisationReportEntity, { id: reportId });
    expect(updatedReport.lastUpdatedByIsSystemUser).toEqual(false);
    expect(updatedReport.lastUpdatedByPortalUserId).toBeNull();
    expect(updatedReport.lastUpdatedByTfmUserId).toEqual(tfmUserId);
  });

  it('should update each of the MATCH fee record audit fields and does not update the non MATCH fee record audit fields', async () => {
    // Arrange
    const report = anUploadedReconciliationInProgressUtilisationReport();
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(report)
        .withId(1)
        .withStatus(FEE_RECORD_STATUS.TO_DO)
        .withLastUpdatedByPortalUserId(portalUserId)
        .withLastUpdatedByTfmUserId(null)
        .withLastUpdatedByIsSystemUser(false)
        .build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus(FEE_RECORD_STATUS.MATCH).build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(3).withStatus(FEE_RECORD_STATUS.MATCH).build(),
    ];
    report.feeRecords = feeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);
    await insertMatchingPaymentsForFeeRecords(feeRecords);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);

    const [notUpdatedFeeRecords, ...updatedFeeRecords] = await Promise.all([
      SqlDbHelper.manager.findOneByOrFail(FeeRecordEntity, { id: 1 }),
      SqlDbHelper.manager.findOneByOrFail(FeeRecordEntity, { id: 2 }),
      SqlDbHelper.manager.findOneByOrFail(FeeRecordEntity, { id: 3 }),
    ]);

    expect(notUpdatedFeeRecords.lastUpdatedByIsSystemUser).toEqual(false);
    expect(notUpdatedFeeRecords.lastUpdatedByPortalUserId).toEqual(portalUserId);
    expect(notUpdatedFeeRecords.lastUpdatedByTfmUserId).toBeNull();

    updatedFeeRecords.forEach((feeRecord) => {
      expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
      expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
      expect(feeRecord.lastUpdatedByTfmUserId).toEqual(tfmUserId);
    });
  });

  it('should update the status of all MATCH fee records to READY_TO_KEY', async () => {
    // Arrange
    const report = anUploadedReconciliationInProgressUtilisationReport();
    const firstFacilityId = '11111111';
    const secondFacilityId = '22222222';
    const feeRecords = [
      // Fee records for same facility where only one has MATCH status
      FeeRecordEntityMockBuilder.forReport(report).withId(1).withFacilityId(firstFacilityId).withStatus(FEE_RECORD_STATUS.TO_DO).build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(2).withFacilityId(firstFacilityId).withStatus(FEE_RECORD_STATUS.MATCH).build(),
      // Fee records for same facility where both have MATCH status
      FeeRecordEntityMockBuilder.forReport(report).withId(3).withFacilityId(secondFacilityId).withStatus(FEE_RECORD_STATUS.MATCH).build(),
      FeeRecordEntityMockBuilder.forReport(report).withId(4).withFacilityId(secondFacilityId).withStatus(FEE_RECORD_STATUS.MATCH).build(),
    ];
    report.feeRecords = feeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);
    await insertMatchingPaymentsForFeeRecords(feeRecords);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);

    const allFeeRecords = await SqlDbHelper.manager.find(FeeRecordEntity, {});
    expect(allFeeRecords).toHaveLength(feeRecords.length);
    expect(allFeeRecords.find(({ id }) => id === 1)!.status).toBe<FeeRecordStatus>(FEE_RECORD_STATUS.TO_DO);
    expect(allFeeRecords.find(({ id }) => id === 2)!.status).toBe<FeeRecordStatus>(FEE_RECORD_STATUS.READY_TO_KEY);
    expect(allFeeRecords.find(({ id }) => id === 3)!.status).toBe<FeeRecordStatus>(FEE_RECORD_STATUS.READY_TO_KEY);
    expect(allFeeRecords.find(({ id }) => id === 4)!.status).toBe<FeeRecordStatus>(FEE_RECORD_STATUS.READY_TO_KEY);
  });

  it('should populate the fee record payment join table paymentAmountUsedForFeeRecord column', async () => {
    // Arrange
    const report = anUploadedReconciliationInProgressUtilisationReport();
    const feeRecords = [FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.MATCH).build()];
    report.feeRecords = feeRecords;
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);
    await insertMatchingPaymentsForFeeRecords(feeRecords);

    const requestBody = aValidRequestBody();

    // Act
    const response = await testApi.post(requestBody).to(getUrl(reportId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);

    const joinTableEntities = await SqlDbHelper.manager.find(FeeRecordPaymentJoinTableEntity, {});
    expect(joinTableEntities).toHaveLength(1);
    expect(joinTableEntities[0].feeRecordId).toEqual(1);
    expect(joinTableEntities[0].paymentId).toEqual(1);
    expect(joinTableEntities[0].paymentAmountUsedForFeeRecord).not.toBeNull();
  });

  describe('when one of the fee records can be auto-reconciled', () => {
    it(`should set the fee record status to ${FEE_RECORD_STATUS.RECONCILED} and sets the dateReconciled field`, async () => {
      // Arrange
      const report = anUploadedReconciliationInProgressUtilisationReport();

      const feeRecordToAutoReconcile = FeeRecordEntityMockBuilder.forReport(report)
        .withId(12)
        .withFeesPaidToUkefForThePeriod(0)
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .build();
      const toDoFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(24).withStatus(FEE_RECORD_STATUS.TO_DO).build();

      report.feeRecords = [feeRecordToAutoReconcile, toDoFeeRecord];
      await SqlDbHelper.saveNewEntry('UtilisationReport', report);

      // Act
      const response = await testApi.post(aValidRequestBody()).to(getUrl(reportId));

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);

      const modifiedFeeRecord = await SqlDbHelper.manager.findOneByOrFail(FeeRecordEntity, { id: 12 });
      expect(modifiedFeeRecord.status).toEqual(FEE_RECORD_STATUS.RECONCILED);
      expect(modifiedFeeRecord.dateReconciled).not.toBeNull();
    });
  });

  async function insertMatchingPaymentsForFeeRecords(feeRecordEntities: FeeRecordEntity[]): Promise<void> {
    let paymentId = 0;
    const payments = feeRecordEntities.map((feeRecord) => {
      paymentId += 1;
      const paymentAmount = feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency();
      return PaymentEntityMockBuilder.forCurrency(feeRecord.paymentCurrency).withId(paymentId).withAmount(paymentAmount).withFeeRecords([feeRecord]).build();
    });
    await SqlDbHelper.saveNewEntries('Payment', payments);
  }
});
