import { FEE_RECORD_STATUS } from '../../constants';
import { FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, UtilisationReportEntityMockBuilder } from '../../test-helpers';
import { Currency } from '../../types';

describe('FeeRecordEntity', () => {
  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

  describe('getFeesPaidToUkefForThePeriodInThePaymentCurrency', () => {
    it('returns the fees paid to ukef for the period with no exchange rate applied when the payment and fees paid currencies match', () => {
      // Arrange
      const feesPaidToUkefForThePeriod = 100.0;
      const feesPaidToUkefForThePeriodCurrency: Currency = 'GBP';
      const paymentCurrency: Currency = 'GBP';

      // the payment exchange rate in this case would usually be 1, but we set it to ensure that it is not used in this case
      const paymentExchangeRate = 1.1;

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withFeesPaidToUkefForThePeriod(feesPaidToUkefForThePeriod)
        .withFeesPaidToUkefForThePeriodCurrency(feesPaidToUkefForThePeriodCurrency)
        .withPaymentCurrency(paymentCurrency)
        .withPaymentExchangeRate(paymentExchangeRate)
        .build();

      const expectedFeesPaidToUkefForThePeriodInThePaymentCurrency = 100.0;

      // Act
      const feesPaidToUkefForThePeriodInThePaymentCurrency = feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency();

      // Assert
      expect(feesPaidToUkefForThePeriodInThePaymentCurrency).toBe(expectedFeesPaidToUkefForThePeriodInThePaymentCurrency);
    });

    it('returns the fees paid to ukef for the period in the payment currency using the payment exchange rate', () => {
      // Arrange
      const feesPaidToUkefForThePeriod = 100.0;
      const feesPaidToUkefForThePeriodCurrency: Currency = 'EUR';
      const paymentCurrency: Currency = 'GBP';
      const paymentExchangeRate = 1.1;

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withFeesPaidToUkefForThePeriod(feesPaidToUkefForThePeriod)
        .withFeesPaidToUkefForThePeriodCurrency(feesPaidToUkefForThePeriodCurrency)
        .withPaymentCurrency(paymentCurrency)
        .withPaymentExchangeRate(paymentExchangeRate)
        .build();

      const expectedFeesPaidToUkefForThePeriodInThePaymentCurrency = 90.91;

      // Act
      const feesPaidToUkefForThePeriodInThePaymentCurrency = feeRecord.getFeesPaidToUkefForThePeriodInThePaymentCurrency();

      // Assert
      expect(feesPaidToUkefForThePeriodInThePaymentCurrency).toBe(expectedFeesPaidToUkefForThePeriodInThePaymentCurrency);
    });
  });

  describe('getTotalFeesAccruedForThePeriodInTheBaseCurrency', () => {
    it('returns the total fees accrued for the period with no exchange rate applied when the base and total fees accrued currencies match', () => {
      // Arrange
      const totalFeesAccruedForThePeriod = 100.0;
      const totalFeesAccruedForThePeriodCurrency: Currency = 'GBP';
      const baseCurrency: Currency = 'GBP';

      // the payment exchange rate in this case would usually be 1, but we set it to ensure that it is not used in this case
      const totalFeesAccruedForThePeriodExchangeRate = 1.1;

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withTotalFeesAccruedForThePeriod(totalFeesAccruedForThePeriod)
        .withTotalFeesAccruedForThePeriodCurrency(totalFeesAccruedForThePeriodCurrency)
        .withTotalFeesAccruedForThePeriodExchangeRate(totalFeesAccruedForThePeriodExchangeRate)
        .withBaseCurrency(baseCurrency)
        .build();

      const expectedTotalFeesAccruedForThePeriodInTheBaseCurrency = 100.0;

      // Act
      const totalFeesAccruedForThePeriodInTheBaseCurrency = feeRecord.getTotalFeesAccruedForThePeriodInTheBaseCurrency();

      // Assert
      expect(totalFeesAccruedForThePeriodInTheBaseCurrency).toBe(expectedTotalFeesAccruedForThePeriodInTheBaseCurrency);
    });

    it('returns the total fees accrued for the period in the base currency using the total fees accrued for the period exchange rate', () => {
      // Arrange
      const totalFeesAccruedForThePeriod = 100.0;
      const totalFeesAccruedForThePeriodCurrency: Currency = 'EUR';
      const baseCurrency: Currency = 'GBP';
      const totalFeesAccruedForThePeriodExchangeRate = 1.1;

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withTotalFeesAccruedForThePeriod(totalFeesAccruedForThePeriod)
        .withTotalFeesAccruedForThePeriodCurrency(totalFeesAccruedForThePeriodCurrency)
        .withTotalFeesAccruedForThePeriodExchangeRate(totalFeesAccruedForThePeriodExchangeRate)
        .withBaseCurrency(baseCurrency)
        .build();

      const expectedTotalFeesAccruedForThePeriodInTheBaseCurrency = 90.91;

      // Act
      const totalFeesAccruedForThePeriodInTheBaseCurrency = feeRecord.getTotalFeesAccruedForThePeriodInTheBaseCurrency();

      // Assert
      expect(totalFeesAccruedForThePeriodInTheBaseCurrency).toBe(expectedTotalFeesAccruedForThePeriodInTheBaseCurrency);
    });
  });

  describe('updateWithStatus', () => {
    it.each(Object.values(FEE_RECORD_STATUS))("sets the report status to '%s' and updates the 'lastUpdatedBy...' fields", (status) => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withStatus(status).build();

      const userId = 'abc123';

      // Act
      feeRecord.updateWithStatus({
        status,
        requestSource: { platform: 'TFM', userId },
      });

      // Assert
      expect(feeRecord.status).toBe(status);
      expect(feeRecord.lastUpdatedByIsSystemUser).toBe(false);
      expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
      expect(feeRecord.lastUpdatedByTfmUserId).toBe(userId);
    });
  });

  describe('removeAllPayments', () => {
    it("removes all payments, sets the report status to 'TO_DO' and updates the 'lastUpdatedBy...' fields", () => {
      // Arrange
      const paymentCurrency: Currency = 'GBP';
      const paymentId = 123;
      const payment = PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(paymentId).build();

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withStatus('MATCH')
        .withPaymentCurrency(paymentCurrency)
        .withPayments([payment])
        .withLastUpdatedByIsSystemUser(true)
        .withLastUpdatedByPortalUserId(null)
        .withLastUpdatedByTfmUserId(null)
        .build();

      const userId = 'abc123';

      // Act
      feeRecord.removeAllPayments({
        requestSource: { platform: 'TFM', userId },
      });

      // Assert
      expect(feeRecord.payments).toHaveLength(0);
      expect(feeRecord.status).toBe('TO_DO');
      expect(feeRecord.lastUpdatedByIsSystemUser).toBe(false);
      expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
      expect(feeRecord.lastUpdatedByTfmUserId).toBe(userId);
    });
  });
});
