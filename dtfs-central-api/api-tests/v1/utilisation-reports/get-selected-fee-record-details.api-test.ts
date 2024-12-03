import { Response } from 'supertest';
import {
  Bank,
  CURRENCY,
  Currency,
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  PaymentMatchingToleranceEntityMockBuilder,
  RECONCILIATION_IN_PROGRESS,
  SelectedFeeRecordDetails,
  SelectedFeeRecordsDetails,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { withSqlIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { wipe } from '../../wipeDB';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { aBank, aReportPeriod } from '../../../test-helpers';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/:reportId/selected-fee-records-details';

const getUrl = (reportId: number | string) => BASE_URL.replace(':reportId', reportId.toString());

interface CustomResponse extends Response {
  body: SelectedFeeRecordDetails;
}

describe(`GET ${BASE_URL}`, () => {
  const bankId = '123';
  const bank: Bank = { ...aBank(), id: bankId, name: 'Test bank' };

  const reportId = 1;
  const reportPeriod = aReportPeriod();

  const gbpTolerance = 1;

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await SqlDbHelper.deleteAllEntries('PaymentMatchingTolerance');

    await wipe(['banks']);

    const banksCollection = await mongoDbClient.getCollection('banks');
    await banksCollection.insertOne(bank);

    const gbpToleranceEntity = PaymentMatchingToleranceEntityMockBuilder.forCurrency(CURRENCY.GBP).withIsActive(true).withThreshold(gbpTolerance).build();

    await SqlDbHelper.saveNewEntry('PaymentMatchingTolerance', gbpToleranceEntity);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await wipe(['banks']);
  });

  withSqlIdPathParameterValidationTests({
    baseUrl: BASE_URL,
    makeRequest: (url) => testApi.get(url, { feeRecordIds: [45] }),
  });

  it('gets selected fee record details', async () => {
    // Arrange
    const report = aReconciliationInProgressReport();

    const aPaymentInGBP = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withAmount(90).withId(123).build();

    const aFeeRecordInGBP = aFeeRecordWithReportAndPaymentCurrencyAndStatusToDo(45, report, CURRENCY.GBP);
    const aFeeRecordInGBPWithAPaymentAttached = FeeRecordEntityMockBuilder.forReport(report)
      .withId(46)
      .withFacilityId('000123')
      .withExporter('Test company')
      .withFeesPaidToUkefForThePeriod(100)
      .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
      .withPaymentCurrency(CURRENCY.GBP)
      .withPayments([aPaymentInGBP])
      .withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH)
      .build();

    report.feeRecords = [aFeeRecordInGBP, aFeeRecordInGBPWithAPaymentAttached];

    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    // Act
    const response: CustomResponse = await testApi.get(getUrl(reportId), { feeRecordIds: [45] });

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body).toEqual<SelectedFeeRecordsDetails>({
      reportPeriod,
      bank: {
        name: bank.name,
      },
      totalReportedPayments: { currency: CURRENCY.GBP, amount: 100 },
      feeRecords: [
        {
          id: 45,
          facilityId: '000123',
          exporter: 'Test company',
          reportedFee: { currency: CURRENCY.GBP, amount: 100 },
          reportedPayments: { currency: CURRENCY.GBP, amount: 100 },
        },
      ],
      payments: [],
      canAddToExistingPayment: true,
      gbpTolerance,
    });
  });

  it(`gets selected fee record details with canAddToExistingPayment set to false when a payment exists in the same currency but has no fee records with the ${FEE_RECORD_STATUS.DOES_NOT_MATCH} status`, async () => {
    // Arrange
    const report = aReconciliationInProgressReport();

    const aPaymentInUSD = PaymentEntityMockBuilder.forCurrency('USD').withAmount(100).withId(124).build();
    const aFeeRecordInUSD = aFeeRecordWithReportAndPaymentCurrencyAndStatusToDo(47, report, 'USD');
    const aFeeRecordInUSDWithAPaymentAttached = FeeRecordEntityMockBuilder.forReport(report)
      .withId(48)
      .withFacilityId('000123')
      .withExporter('Test company')
      .withFeesPaidToUkefForThePeriod(75)
      .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
      .withPaymentCurrency('USD')
      .withPayments([aPaymentInUSD])
      .withStatus(FEE_RECORD_STATUS.MATCH)
      .build();

    report.feeRecords = [aFeeRecordInUSD, aFeeRecordInUSDWithAPaymentAttached];

    await SqlDbHelper.saveNewEntry('UtilisationReport', report);

    // Act
    const response: CustomResponse = await testApi.get(getUrl(reportId), { feeRecordIds: [47] });

    // Assert
    expect(response.status).toEqual(200);
    expect(response.body).toEqual<SelectedFeeRecordsDetails>({
      reportPeriod,
      bank: {
        name: bank.name,
      },
      totalReportedPayments: { currency: 'USD', amount: 100 },
      feeRecords: [
        {
          id: 47,
          facilityId: '000123',
          exporter: 'Test company',
          reportedFee: { currency: CURRENCY.GBP, amount: 100 },
          reportedPayments: { currency: 'USD', amount: 100 },
        },
      ],
      payments: [],
      canAddToExistingPayment: false,
      gbpTolerance,
    });
  });

  function aReconciliationInProgressReport() {
    return UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS).withId(reportId).withReportPeriod(reportPeriod).withBankId(bankId).build();
  }

  function aFeeRecordWithReportAndPaymentCurrencyAndStatusToDo(id: number, report: UtilisationReportEntity, paymentCurrency: Currency) {
    return FeeRecordEntityMockBuilder.forReport(report)
      .withId(id)
      .withFacilityId('000123')
      .withExporter('Test company')
      .withFeesPaidToUkefForThePeriod(100)
      .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
      .withPaymentCurrency(paymentCurrency)
      .withStatus(FEE_RECORD_STATUS.TO_DO)
      .build();
  }
});
