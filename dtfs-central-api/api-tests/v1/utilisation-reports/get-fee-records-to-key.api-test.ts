import { Response } from 'supertest';
import { HttpStatusCode } from 'axios';
import { Bank, Currency, FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, ReportPeriod, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import app from '../../../src/createApp';
import createApi from '../../api';
import { SqlDbHelper } from '../../sql-db-helper';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { wipe } from '../../wipeDB';
import { aBank } from '../../../test-helpers/test-data/bank';
import { FeeRecordToKey, UtilisationReportWithFeeRecordsToKey } from '../../../src/types/utilisation-reports';

interface CustomResponse extends Response {
  body: UtilisationReportWithFeeRecordsToKey;
}

console.error = jest.fn();

const api = createApi(app);

describe('GET /v1/utilisation-reports/:reportId/fee-records-to-key', () => {
  const getUrl = (reportId: number | string) => `/v1/utilisation-reports/${reportId}/fee-records-to-key`;

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

  const reconciliationInProgressReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS')
    .withId(reportId)
    .withBankId(bankId)
    .withReportPeriod(reportPeriod)
    .build();

  const paymentCurrency: Currency = 'GBP';

  const payments = [
    PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(1).withAmount(100).build(),
    PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(2).withAmount(50).build(),
  ];

  const feeRecords = [
    FeeRecordEntityMockBuilder.forReport(reconciliationInProgressReport)
      .withId(1)
      .withFacilityId('12345678')
      .withExporter('Test exporter 1')
      .withStatus('MATCH')
      .withFeesPaidToUkefForThePeriod(75)
      .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
      .withPaymentCurrency(paymentCurrency)
      .withPayments(payments)
      .build(),
    FeeRecordEntityMockBuilder.forReport(reconciliationInProgressReport)
      .withId(2)
      .withFacilityId('87654321')
      .withExporter('Test exporter 2')
      .withStatus('MATCH')
      .withFeesPaidToUkefForThePeriod(75)
      .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
      .withPaymentCurrency(paymentCurrency)
      .withPayments(payments)
      .build(),
  ];
  reconciliationInProgressReport.feeRecords = feeRecords;

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    await SqlDbHelper.saveNewEntry('UtilisationReport', reconciliationInProgressReport);

    await wipe(['banks']);

    const banksCollection = await mongoDbClient.getCollection('banks');
    await banksCollection.insertOne(bank);
  });

  beforeEach(async () => {
    await SqlDbHelper.saveNewEntry('UtilisationReport', reconciliationInProgressReport);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  it('returns a 400 when the report id is not a valid id', async () => {
    // Act
    const response: CustomResponse = await api.get(getUrl('invalid-id'));

    // Assert
    expect(response.status).toBe(HttpStatusCode.BadRequest);
  });

  it('returns a 404 when no report with the supplied id can be found', async () => {
    // Act
    const response: CustomResponse = await api.get(getUrl(reportId + 1));

    // Assert
    expect(response.status).toBe(HttpStatusCode.NotFound);
  });

  it('returns a 404 when the bank with the same id as the report cannot be found', async () => {
    // Arrange
    const reportWithDifferentBankId = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').withId(2).withBankId('456').build();

    await SqlDbHelper.saveNewEntry('UtilisationReport', reportWithDifferentBankId);

    // Act
    const response: CustomResponse = await api.get(getUrl(2));

    // Assert
    expect(response.status).toBe(HttpStatusCode.NotFound);
  });

  it('returns a 200 with a valid report id', async () => {
    // Act
    const response: CustomResponse = await api.get(getUrl(reportId));

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);
  });

  it('returns a body containing the report id', async () => {
    // Act
    const response: CustomResponse = await api.get(getUrl(reportId));

    // Assert
    expect(response.body.id).toBe(reportId);
  });

  it('returns a body containing the session bank', async () => {
    // Act
    const response: CustomResponse = await api.get(getUrl(reportId));

    // Assert
    expect(response.body.bank).toEqual({ id: bankId, name: bankName });
  });

  it('returns a body containing the report period', async () => {
    // Act
    const response: CustomResponse = await api.get(getUrl(reportId));

    // Assert
    expect(response.body.reportPeriod).toEqual(reportPeriod);
  });

  it('returns a body containing the fee records to key', async () => {
    // Act
    const response: CustomResponse = await api.get(getUrl(reportId));

    // Assert
    expect(response.body.feeRecords).toEqual<FeeRecordToKey[]>([
      {
        id: 1,
        facilityId: '12345678',
        exporter: 'Test exporter 1',
        reportedFees: { currency: paymentCurrency, amount: 75 },
        reportedPayments: { currency: paymentCurrency, amount: 75 },
        paymentsReceived: [{ currency: paymentCurrency, amount: 75 }],
        status: 'MATCH',
      },
      {
        id: 2,
        facilityId: '87654321',
        exporter: 'Test exporter 2',
        reportedFees: { currency: paymentCurrency, amount: 75 },
        reportedPayments: { currency: paymentCurrency, amount: 75 },
        paymentsReceived: [{ currency: paymentCurrency, amount: 75 }],
        status: 'MATCH',
      },
    ]);
  });
});
