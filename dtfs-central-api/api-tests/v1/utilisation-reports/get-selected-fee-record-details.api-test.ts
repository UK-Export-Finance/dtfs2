import { Response } from 'supertest';
import {
  Bank,
  Currency,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  SelectedFeeRecordDetails,
  SelectedFeeRecordsDetails,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { testApi } from '../../test-api';
import { SqlDbHelper } from '../../sql-db-helper';
import { wipe } from '../../wipeDB';
import { mongoDbClient } from '../../../src/drivers/db-client';
import { aBank } from '../../../test-helpers/test-data/bank';
import { aReportPeriod } from '../../../test-helpers/test-data/report-period';

const getUrl = (reportId: number | string) => `/v1/utilisation-reports/${reportId}/selected-fee-records-details`;

interface CustomResponse extends Response {
  body: SelectedFeeRecordDetails;
}

describe('GET /v1/utilisation-reports/:id/selected-fee-records-details', () => {
  const bankId = '123';
  const bank: Bank = { ...aBank(), id: bankId, name: 'Test bank' };

  const reportId = 1;

  const reportPeriod = aReportPeriod();
  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS')
    .withId(reportId)
    .withReportPeriod(reportPeriod)
    .withBankId(bankId)
    .build();

  const aPaymentInGBP = PaymentEntityMockBuilder.forCurrency('GBP').withAmount(90).withId(123).build();
  const aPaymentInUSD = PaymentEntityMockBuilder.forCurrency('USD').withAmount(100).withId(124).build();

  const aFeeRecordInGBP = aFeeRecordWithPaymentCurrencyAndToDoStatus(45, 'GBP');
  const aFeeRecordInGBPWithAPaymentAttached = FeeRecordEntityMockBuilder.forReport(utilisationReport)
    .withId(46)
    .withFacilityId('000123')
    .withExporter('Test company')
    .withFeesPaidToUkefForThePeriod(100)
    .withFeesPaidToUkefForThePeriodCurrency('GBP')
    .withPaymentCurrency('GBP')
    .withPayments([aPaymentInGBP])
    .withStatus('DOES_NOT_MATCH')
    .build();
  const aFeeRecordInUSD = aFeeRecordWithPaymentCurrencyAndToDoStatus(47, 'USD');
  const aFeeRecordInUSDWithAPaymentAttached = FeeRecordEntityMockBuilder.forReport(utilisationReport)
    .withId(48)
    .withFacilityId('000123')
    .withExporter('Test company')
    .withFeesPaidToUkefForThePeriod(75)
    .withFeesPaidToUkefForThePeriodCurrency('GBP')
    .withPaymentCurrency('USD')
    .withPayments([aPaymentInUSD])
    .withStatus('MATCH')
    .build();

  utilisationReport.feeRecords = [aFeeRecordInGBP, aFeeRecordInGBPWithAPaymentAttached, aFeeRecordInUSD, aFeeRecordInUSDWithAPaymentAttached];

  beforeAll(async () => {
    await SqlDbHelper.initialize();
    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await SqlDbHelper.saveNewEntry('UtilisationReport', utilisationReport);

    await wipe(['banks']);

    const banksCollection = await mongoDbClient.getCollection('banks');
    await banksCollection.insertOne(bank);
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

  function aFeeRecordWithPaymentCurrencyAndToDoStatus(id: number, paymentCurrency: Currency) {
    return FeeRecordEntityMockBuilder.forReport(utilisationReport)
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
