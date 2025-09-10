import { FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common/test-helpers';
import { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { In } from 'typeorm';
import { difference } from 'lodash';
import {
  FEE_RECORD_STATUS,
  FeeRecordEntity,
  FeeRecordStatus,
  PaymentEntity,
  RECONCILIATION_IN_PROGRESS,
  UTILISATION_REPORT_STATUS,
  UtilisationReportEntity,
  CURRENCY,
} from '@ukef/dtfs2-common';
import { withSqlIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { PatchPaymentPayload } from '../../../server/v1/routes/middleware/payload-validation';
import { aTfmSessionUser } from '../../../test-helpers';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/payment/:paymentId';

describe(`PATCH ${BASE_URL}`, () => {
  const getUrl = (reportId: string | number, paymentId: string | number) =>
    BASE_URL.replace(':reportId', reportId.toString()).replace(':paymentId', paymentId.toString());

  const reportId = 12;
  const paymentId = 34;

  const aPatchPaymentRequestBody = (): PatchPaymentPayload => ({
    paymentAmount: 100,
    datePaymentReceived: new Date(),
    paymentReference: 'A payment reference',
    user: aTfmSessionUser(),
  });

  const payment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(paymentId).build();

  const aReport = () => UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withId(reportId).build();

  const feeRecordsForReportWithPayments = (report: UtilisationReportEntity, payments: PaymentEntity[]) => [
    FeeRecordEntityMockBuilder.forReport(report)
      .withId(1)
      .withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH)
      .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
      .withPayments(payments)
      .build(),
    FeeRecordEntityMockBuilder.forReport(report)
      .withId(2)
      .withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH)
      .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
      .withPayments(payments)
      .build(),
  ];

  beforeAll(async () => {
    await SqlDbHelper.initialize();
  });

  beforeEach(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    const report = aReport();
    report.feeRecords = feeRecordsForReportWithPayments(report, [payment]);
    await SqlDbHelper.saveNewEntry('UtilisationReport', report);
  });

  withSqlIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url) => testApi.patch(aPatchPaymentRequestBody()).to(url),
  });

  it('returns a 404 when the payment with the supplied id does not exist', async () => {
    // Act
    const response = await testApi.patch(aPatchPaymentRequestBody()).to(getUrl(reportId, paymentId + 1));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it('returns a 404 when the payment with the supplied id exists but it is not attached to a report with the supplied id', async () => {
    // Arrange
    const differentPaymentId = 25;
    const differentPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(differentPaymentId).build();
    await SqlDbHelper.saveNewEntry('Payment', differentPayment);

    // Act
    const response = await testApi.patch(aPatchPaymentRequestBody()).to(getUrl(reportId, differentPaymentId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.NotFound);
  });

  it.each(difference(Object.values(UTILISATION_REPORT_STATUS), [UTILISATION_REPORT_STATUS.RECONCILIATION_IN_PROGRESS]))(
    "returns a 400 when the report the payment is attached has the status '%s'",
    async (status) => {
      // Arrange
      const report = aReport();
      report.status = status;
      report.feeRecords = feeRecordsForReportWithPayments(report, [payment]);

      await SqlDbHelper.deleteAllEntries('UtilisationReport');
      await SqlDbHelper.saveNewEntry('UtilisationReport', report);

      // Act
      const response = await testApi.patch(aPatchPaymentRequestBody()).to(getUrl(reportId, paymentId));

      // Assert
      expect(response.status).toEqual(HttpStatusCode.BadRequest);
    },
  );

  it('returns a 200 when the payment can be edited', async () => {
    // Act
    const response = await testApi.patch(aPatchPaymentRequestBody()).to(getUrl(reportId, paymentId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);
  });

  it('updates the payment, fee records and report with the fields supplied in the payload', async () => {
    // Arrange
    const paymentAmount = 314.59;
    const datePaymentReceived = new Date('2024-02-04');
    const paymentReference = 'A new payment reference';
    const tfmUserId = new ObjectId().toString();

    const requestBody: PatchPaymentPayload = {
      paymentAmount,
      datePaymentReceived,
      paymentReference,
      user: {
        ...aTfmSessionUser(),
        _id: tfmUserId,
      },
    };

    // Act
    const response = await testApi.patch(requestBody).to(getUrl(reportId, paymentId));

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);

    const paymentEntity = (await SqlDbHelper.manager.findOneBy(PaymentEntity, { id: paymentId }))!;

    expect(paymentEntity.amount).toEqual(paymentAmount);
    expect(paymentEntity.dateReceived).toEqual(datePaymentReceived);
    expect(paymentEntity.reference).toEqual(paymentReference);

    expect(paymentEntity.lastUpdatedByTfmUserId).toEqual(tfmUserId);
    expect(paymentEntity.lastUpdatedByPortalUserId).toBeNull();
    expect(paymentEntity.lastUpdatedByIsSystemUser).toEqual(false);

    const reportEntity = (await SqlDbHelper.manager.findOneBy(UtilisationReportEntity, { id: reportId }))!;

    expect(reportEntity.lastUpdatedByTfmUserId).toEqual(tfmUserId);
    expect(reportEntity.lastUpdatedByPortalUserId).toBeNull();
    expect(reportEntity.lastUpdatedByIsSystemUser).toEqual(false);

    const feeRecordEntities = await SqlDbHelper.manager.findBy(FeeRecordEntity, { id: In([1, 2]) });

    expect(feeRecordEntities).toHaveLength(2);
    feeRecordEntities.forEach((feeRecord) => {
      expect(feeRecord.lastUpdatedByTfmUserId).toEqual(tfmUserId);
      expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
      expect(feeRecord.lastUpdatedByIsSystemUser).toEqual(false);
    });
  });

  it('sets the fee record status to MATCH if the edited payment amount matches the fee record amounts', async () => {
    // Arrange
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    const report = aReport();
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(report)
        .withId(1)
        .withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH)
        .withFeesPaidToUkefForThePeriod(100)
        .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
        .withPaymentCurrency(CURRENCY.GBP)
        .withPayments([payment])
        .build(),
      FeeRecordEntityMockBuilder.forReport(report)
        .withId(2)
        .withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH)
        .withFeesPaidToUkefForThePeriod(200)
        .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
        .withPaymentCurrency(CURRENCY.GBP)
        .withPayments([payment])
        .build(),
    ];
    report.feeRecords = feeRecords;

    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody: PatchPaymentPayload = {
      ...aPatchPaymentRequestBody(),
      paymentAmount: 300,
    };

    // Act
    const oldFeeRecords = await SqlDbHelper.manager.findBy(FeeRecordEntity, { id: In([1, 2]) });
    const response = await testApi.patch(requestBody).to(getUrl(reportId, paymentId));
    const newFeeRecords = await SqlDbHelper.manager.findBy(FeeRecordEntity, { id: In([1, 2]) });

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);

    expect(oldFeeRecords).toHaveLength(feeRecords.length);
    oldFeeRecords.forEach((feeRecord) => {
      expect(feeRecord.status).toBe<FeeRecordStatus>(FEE_RECORD_STATUS.DOES_NOT_MATCH);
    });

    expect(newFeeRecords).toHaveLength(feeRecords.length);
    newFeeRecords.forEach((feeRecord) => {
      expect(feeRecord.status).toBe<FeeRecordStatus>(FEE_RECORD_STATUS.MATCH);
    });
  });

  it('sets the fee record status to DOES_NOT_MATCH if the edited payment amount does not match the fee record amounts', async () => {
    // Arrange
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    const report = aReport();
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(report)
        .withId(1)
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .withFeesPaidToUkefForThePeriod(100)
        .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
        .withPaymentCurrency(CURRENCY.GBP)
        .withPayments([payment])
        .build(),
      FeeRecordEntityMockBuilder.forReport(report)
        .withId(2)
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .withFeesPaidToUkefForThePeriod(200)
        .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
        .withPaymentCurrency(CURRENCY.GBP)
        .withPayments([payment])
        .build(),
    ];
    report.feeRecords = feeRecords;

    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    const requestBody: PatchPaymentPayload = {
      ...aPatchPaymentRequestBody(),
      paymentAmount: 200,
    };

    // Act
    const oldFeeRecords = await SqlDbHelper.manager.findBy(FeeRecordEntity, { id: In([1, 2]) });
    const response = await testApi.patch(requestBody).to(getUrl(reportId, paymentId));
    const newFeeRecords = await SqlDbHelper.manager.findBy(FeeRecordEntity, { id: In([1, 2]) });

    // Assert
    expect(response.status).toEqual(HttpStatusCode.Ok);

    expect(oldFeeRecords).toHaveLength(feeRecords.length);
    oldFeeRecords.forEach((feeRecord) => {
      expect(feeRecord.status).toBe<FeeRecordStatus>(FEE_RECORD_STATUS.MATCH);
    });

    expect(newFeeRecords).toHaveLength(feeRecords.length);
    newFeeRecords.forEach((feeRecord) => {
      expect(feeRecord.status).toBe<FeeRecordStatus>(FEE_RECORD_STATUS.DOES_NOT_MATCH);
    });
  });
});
