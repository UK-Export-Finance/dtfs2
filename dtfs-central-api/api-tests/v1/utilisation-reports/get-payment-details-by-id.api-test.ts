import { Response } from 'supertest';
import { HttpStatusCode, getUri } from 'axios';
import { Bank, Currency, FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, ReportPeriod, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { withSqlIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { wipe } from '../../wipeDB';
import { aBank } from '../../../test-helpers';
import { GetPaymentDetailsResponseBody } from '../../../src/v1/controllers/utilisation-report-service/get-payment-details-by-id.controller';

interface CustomResponse extends Response {
  body: GetPaymentDetailsResponseBody;
}

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/payment/:paymentId';

describe(`GET ${BASE_URL}`, () => {
  const getUrl = (reportId: number | string, paymentId: number | string, includeFeeRecords: boolean | undefined = false) =>
    getUri({
      url: BASE_URL.replace(':reportId', reportId.toString()).replace(':paymentId', paymentId.toString()),
      params: { includeFeeRecords },
    });

  const bankId = '123';
  const bankName = 'Test bank';
  const bank: Bank = {
    ...aBank(),
    id: bankId,
    name: bankName,
  };

  const reportPeriod: ReportPeriod = {
    start: { month: 1, year: 2024 },
    end: { month: 1, year: 2024 },
  };

  const reportId = 1;
  const paymentId = 1;

  const paymentCurrency: Currency = 'GBP';

  const reconciliationInProgressReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS')
    .withId(reportId)
    .withBankId(bankId)
    .withReportPeriod(reportPeriod)
    .build();

  const feeRecords = [
    FeeRecordEntityMockBuilder.forReport(reconciliationInProgressReport)
      .withId(1)
      .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
      .withPaymentCurrency(paymentCurrency)
      .build(),
    FeeRecordEntityMockBuilder.forReport(reconciliationInProgressReport)
      .withId(2)
      .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
      .withPaymentCurrency(paymentCurrency)
      .build(),
  ];

  const payment = PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(paymentId).withFeeRecords(feeRecords).build();

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    await wipe(['banks']);

    const banksCollection = await mongoDbClient.getCollection('banks');
    await banksCollection.insertOne(bank);
  });

  beforeEach(async () => {
    await SqlDbHelper.saveNewEntry('UtilisationReport', reconciliationInProgressReport);
    await SqlDbHelper.saveNewEntry('Payment', payment);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAllEntries('Payment');
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  withSqlIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url) => testApi.get(url),
  });

  it('returns a 404 when no payment with the supplied id can be found', async () => {
    // Act
    const response = (await testApi.get(getUrl(reportId, paymentId + 1))) as CustomResponse;

    // Assert
    expect(response.status).toBe(HttpStatusCode.NotFound);
  });

  it('returns a 404 when the payment is not attached to a report with the supplied id', async () => {
    // Act
    const response = (await testApi.get(getUrl(reportId + 1, paymentId))) as CustomResponse;

    // Assert
    expect(response.status).toBe(HttpStatusCode.NotFound);
  });

  it('returns a 404 when the bank with the same id as the report cannot be found', async () => {
    // Arrange
    const reportWithDifferentBankId = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(2).withBankId('456').build();
    const feeRecord = FeeRecordEntityMockBuilder.forReport(reportWithDifferentBankId).build();

    const paymentForNewReport = PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(2).withFeeRecords([feeRecord]).build();
    await SqlDbHelper.saveNewEntry('Payment', paymentForNewReport);

    // Act
    const response = (await testApi.get(getUrl(2, 2))) as CustomResponse;

    // Assert
    expect(response.status).toBe(HttpStatusCode.NotFound);
  });

  it('returns a 200 with a valid report and payment id', async () => {
    // Act
    const response = (await testApi.get(getUrl(reportId, paymentId))) as CustomResponse;

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);
  });

  it('returns a request body containing the feeRecords and totalReportedPayments when the includeFeeRecords query is set to true', async () => {
    // Act
    const response = (await testApi.get(getUrl(reportId, paymentId, true))) as CustomResponse;

    // Assert
    expect(response.body.feeRecords).toBeDefined();
    expect(response.body.totalReportedPayments).toBeDefined();
  });

  it('returns a request body not containing the feeRecords and totalReportedPayments when the includeFeeRecords query is set to false', async () => {
    // Act
    const response = (await testApi.get(getUrl(reportId, paymentId, false))) as CustomResponse;

    // Assert
    expect(response.body.feeRecords).toBeUndefined();
    expect(response.body.totalReportedPayments).toBeUndefined();
  });

  it('returns a request body not containing the feeRecords and totalReportedPayments when the includeFeeRecords query is undefined', async () => {
    // Act
    const response = (await testApi.get(getUrl(reportId, paymentId, undefined))) as CustomResponse;

    // Assert
    expect(response.body.feeRecords).toBeUndefined();
    expect(response.body.totalReportedPayments).toBeUndefined();
  });
});
