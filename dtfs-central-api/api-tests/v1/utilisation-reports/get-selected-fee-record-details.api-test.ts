import { Response } from 'supertest';
import {
  Bank,
  Currency,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  SelectedFeeRecordDetails,
  SelectedFeeRecordsDetails,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { wipe } from '../../wipeDB';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { aBank, aReportPeriod } from '../../../test-helpers/test-data';

const getUrl = (reportId: number | string) => `/v1/utilisation-reports/${reportId}/selected-fee-records-details`;

interface CustomResponse extends Response {
  body: SelectedFeeRecordDetails;
}

describe('GET /v1/utilisation-reports/:id/selected-fee-records-details', () => {
  const bankId = '123';
  const bank: Bank = { ...aBank(), id: bankId, name: 'Test bank' };

  const reportId = 1;
  const reportPeriod = aReportPeriod();

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');

    await wipe(['banks']);

    const banksCollection = await mongoDbClient.getCollection('banks');
    await banksCollection.insertOne(bank);
  });

  afterEach(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
  });

  afterAll(async () => {
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await wipe(['banks']);
  });

  describe('GET /v1/utilisation-reports/:id/selected-fee-records-details', () => {
    it('returns 400 when an invalid report ID is provided', async () => {
      // Arrange
      const invalidReportId = 'invalid-id';

      // Act
      const response: CustomResponse = await testApi.get(getUrl(invalidReportId), { feeRecordIds: [45] });

      // Assert
      expect(response.status).toEqual(400);
    });

    it('gets selected fee record details', async () => {
      // Arrange
      const report = aReconciliationInProgressReport();

      const aPaymentInGBP = PaymentEntityMockBuilder.forCurrency('GBP').withAmount(90).withId(123).build();

      const aFeeRecordInGBP = aFeeRecordWithReportAndPaymentCurrencyAndStatusToDo(45, report, 'GBP');
      const aFeeRecordInGBPWithAPaymentAttached = FeeRecordEntityMockBuilder.forReport(report)
        .withId(46)
        .withFacilityId('000123')
        .withExporter('Test company')
        .withFeesPaidToUkefForThePeriod(100)
        .withFeesPaidToUkefForThePeriodCurrency('GBP')
        .withPaymentCurrency('GBP')
        .withPayments([aPaymentInGBP])
        .withStatus('DOES_NOT_MATCH')
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
        totalReportedPayments: { currency: 'GBP', amount: 100 },
        feeRecords: [
          {
            id: 45,
            facilityId: '000123',
            exporter: 'Test company',
            reportedFee: { currency: 'GBP', amount: 100 },
            reportedPayments: { currency: 'GBP', amount: 100 },
          },
        ],
        payments: [],
        canAddToExistingPayment: true,
      });
    });

    it("gets selected fee record details with canAddToExistingPayment set to false when a payment exists in the same currency but has no fee records with the 'does not match' status", async () => {
      // Arrange
      const report = aReconciliationInProgressReport();

      const aPaymentInUSD = PaymentEntityMockBuilder.forCurrency('USD').withAmount(100).withId(124).build();
      const aFeeRecordInUSD = aFeeRecordWithReportAndPaymentCurrencyAndStatusToDo(47, report, 'USD');
      const aFeeRecordInUSDWithAPaymentAttached = FeeRecordEntityMockBuilder.forReport(report)
        .withId(48)
        .withFacilityId('000123')
        .withExporter('Test company')
        .withFeesPaidToUkefForThePeriod(75)
        .withFeesPaidToUkefForThePeriodCurrency('GBP')
        .withPaymentCurrency('USD')
        .withPayments([aPaymentInUSD])
        .withStatus('MATCH')
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
            reportedFee: { currency: 'GBP', amount: 100 },
            reportedPayments: { currency: 'USD', amount: 100 },
          },
        ],
        payments: [],
        canAddToExistingPayment: false,
      });
    });
  });

  function aReconciliationInProgressReport() {
    return UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS')
      .withId(reportId)
      .withReportPeriod(reportPeriod)
      .withBankId(bankId)
      .build();
  }

  function aFeeRecordWithReportAndPaymentCurrencyAndStatusToDo(id: number, report: UtilisationReportEntity, paymentCurrency: Currency) {
    return FeeRecordEntityMockBuilder.forReport(report)
      .withId(id)
      .withFacilityId('000123')
      .withExporter('Test company')
      .withFeesPaidToUkefForThePeriod(100)
      .withFeesPaidToUkefForThePeriodCurrency('GBP')
      .withPaymentCurrency(paymentCurrency)
      .withStatus('TO_DO')
      .build();
  }
});
