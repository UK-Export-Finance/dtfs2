import { CurrencyAndAmount, FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { getBankNameById } from '../../../../repositories/banks-repo';
import { mapToSelectedFeeRecordDetails } from './helpers';
import { aReportPeriod } from '../../../../../test-helpers/test-data/report-period';

jest.mock('../../../../repositories/banks-repo');

describe('get selected fee record details controller helpers', () => {
  const BANK_NAME = 'Test bank';
  beforeEach(() => {
    jest.mocked(getBankNameById).mockResolvedValue(BANK_NAME);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('mapToSelectedFeeRecordDetails', () => {
    it('sets bank name', async () => {
      // Act
      const bankId = '123';
      const result = await mapToSelectedFeeRecordDetails(bankId, aReportPeriod(), [aFeeRecord()]);

      // Assert
      expect(result.bank).toEqual({ name: BANK_NAME });
    });

    it('maps report period', async () => {
      // Arrange
      const bankId = '123';
      const reportPeriod = aReportPeriod();

      // Act
      const result = await mapToSelectedFeeRecordDetails(bankId, reportPeriod, [aFeeRecord()]);

      // Assert
      expect(result.reportPeriod).toEqual(reportPeriod);
    });

    it('maps the fee record facilityId, id and exporter', async () => {
      // Arrange
      const bankId = '123';
      const feeRecord = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withExporter('Test company')
        .withFacilityId('00012345')
        .withId(2)
        .build();
      // Act
      const result = await mapToSelectedFeeRecordDetails(bankId, aReportPeriod(), [feeRecord]);

      // Assert
      expect(result.feeRecords[0]).toEqual(expect.objectContaining({ id: 2, facilityId: '00012345', exporter: 'Test company' }));
    });

    it('maps the fees paid to ukef for period to reported payment with no conversion when payment currency matches fees paid to ukef for the period currency', async () => {
      // Arrange
      const bankId = '123';
      const feeRecord = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withFeesPaidToUkefForThePeriod(200)
        .withFeesPaidToUkefForThePeriodCurrency('USD')
        .withPaymentCurrency('USD')
        .build();
      // Act
      const result = await mapToSelectedFeeRecordDetails(bankId, aReportPeriod(), [feeRecord]);

      // Assert
      expect(result.feeRecords[0].reportedPayment).toEqual<CurrencyAndAmount>({ amount: 200, currency: 'USD' });
    });

    it('sets the reported payment to the fees paid to ukef for the period converted into the payment currency when the payment currency does not match the fees paid to ukef for the period currency', async () => {
      // Arrange
      const bankId = '123';
      const feeRecord = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withFeesPaidToUkefForThePeriod(2200)
        .withFeesPaidToUkefForThePeriodCurrency('EUR')
        .withPaymentCurrency('GBP')
        .withPaymentExchangeRate(1.1)
        .build();

      // Act
      const result = await mapToSelectedFeeRecordDetails(bankId, aReportPeriod(), [feeRecord]);

      // Assert
      expect(result.feeRecords[0].reportedPayment).toEqual<CurrencyAndAmount>({ amount: 2000, currency: 'GBP' });
    });

    it('maps the fees paid to ukef for the period to the reported fee', async () => {
      // Arrange
      const bankId = '123';
      const feeRecord = FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build())
        .withFeesPaidToUkefForThePeriod(2200)
        .withFeesPaidToUkefForThePeriodCurrency('EUR')
        .build();
      // Act
      const result = await mapToSelectedFeeRecordDetails(bankId, aReportPeriod(), [feeRecord]);

      // Assert
      expect(result.feeRecords[0].reportedFee).toEqual<CurrencyAndAmount>({ amount: 2200, currency: 'EUR' });
    });

    it('calculates total reported payments in payment currency by adding up reported payments of all fee records', async () => {
      // Arrange
      const bankId = '123';
      const aUtilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
      const feeRecordWithDifferingCurrencies = FeeRecordEntityMockBuilder.forReport(aUtilisationReport)
        .withFeesPaidToUkefForThePeriod(2200)
        .withFeesPaidToUkefForThePeriodCurrency('EUR')
        .withPaymentCurrency('GBP')
        .withPaymentExchangeRate(1.1)
        .build();
      const feeRecordWithMatchingCurrencies = FeeRecordEntityMockBuilder.forReport(aUtilisationReport)
        .withFeesPaidToUkefForThePeriod(1000)
        .withFeesPaidToUkefForThePeriodCurrency('GBP')
        .withPaymentCurrency('GBP')
        .build();

      // Act
      const result = await mapToSelectedFeeRecordDetails(bankId, aReportPeriod(), [feeRecordWithDifferingCurrencies, feeRecordWithMatchingCurrencies]);

      // Assert
      expect(result.totalReportedPayments).toEqual<CurrencyAndAmount>({ amount: 3000, currency: 'GBP' });
    });
  });

  function aFeeRecord() {
    return FeeRecordEntityMockBuilder.forReport(UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build()).build();
  }
});
