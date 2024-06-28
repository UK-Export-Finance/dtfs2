import { Response } from 'supertest';
import { HttpStatusCode } from 'axios';
import { Bank, Currency, FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, ReportPeriod, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import app from '../../../src/createApp';
import createApi from '../../api';
import { SqlDbHelper } from '../../sql-db-helper';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { wipe } from '../../wipeDB';
import { aBank } from '../../../test-helpers/test-data/bank';
import { GetPaymentDetailsResponseBody } from '../../../src/v1/controllers/utilisation-report-service/get-payment-details-by-id.controller';

interface CustomResponse extends Response {
  body: GetPaymentDetailsResponseBody;
}

console.error = jest.fn();

const api = createApi(app);

describe('GET /v1/utilisation-reports/:reportId/payment/:paymentId', () => {
  const getUrl = (reportId: number | string, paymentId: number | string) => `/v1/utilisation-reports/${reportId}/payment/${paymentId}`;

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

  it('returns a 400 when the report id is not a valid id', async () => {
    // Act
    const response: CustomResponse = await api.get(getUrl('invalid-id', paymentId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it('returns a 400 when the payment id is not a valid id', async () => {
    // Act
    const response: CustomResponse = await api.get(getUrl(reportId, 'invalid-id'));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it('returns a 404 when no payment with the supplied id can be found', async () => {
    // Act
    const response: CustomResponse = await api.get(getUrl(reportId, paymentId + 1));

    // Assert
    expect(response.status).toBe(HttpStatusCode.NotFound);
  });

  it('returns a 404 when the payment is not attached to a report with the supplied id', async () => {
    // Act
    const response: CustomResponse = await api.get(getUrl(reportId + 1, paymentId));

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
    const response: CustomResponse = await api.get(getUrl(2, 2));

    // Assert
    expect(response.status).toBe(HttpStatusCode.NotFound);
  });

  it('returns a 200 with a valid report and payment id', async () => {
    // Act
    const response: CustomResponse = await api.get(getUrl(reportId, paymentId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);
  });
});
