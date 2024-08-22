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

  describe('markAsReconciled', () => {
    const mockDate = new Date('2024-01-01');

    beforeAll(() => {
      jest.useFakeTimers();
    });

    beforeEach(() => {
      jest.setSystemTime(mockDate);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('sets the fee record dateReconciled to now and the reconciledByUserId to the supplied value', () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withDateReconciled(null).build();

      // Act
      feeRecord.markAsReconciled({ reconciledByUserId: 'abc123', requestSource: { platform: 'TFM', userId: 'def456' } });

      // Assert
      expect(feeRecord.dateReconciled).toEqual(mockDate);
      expect(feeRecord.reconciledByUserId).toBe('abc123');
    });

    it("sets the fee record status to RECONCILED and updates the 'lastUpdatedBy...' fields", () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withStatus(FEE_RECORD_STATUS.READY_TO_KEY)
        .withLastUpdatedByIsSystemUser(true)
        .withLastUpdatedByPortalUserId(null)
        .withLastUpdatedByTfmUserId(null)
        .build();

      // Act
      feeRecord.markAsReconciled({ reconciledByUserId: 'abc123', requestSource: { platform: 'TFM', userId: 'abc123' } });

      // Assert
      expect(feeRecord.status).toBe(FEE_RECORD_STATUS.RECONCILED);
      expect(feeRecord.lastUpdatedByIsSystemUser).toBe(false);
      expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
      expect(feeRecord.lastUpdatedByTfmUserId).toBe('abc123');
    });
  });

  describe('markAsReadyToKey', () => {
    it('sets the fee record dateReconciled and reconciledByUserId to null', () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withDateReconciled(new Date('2024')).withReconciledByUserId('abc123').build();

      // Act
      feeRecord.markAsReadyToKey({ requestSource: { platform: 'TFM', userId: 'abc123' } });

      // Assert
      expect(feeRecord.dateReconciled).toBeNull();
      expect(feeRecord.reconciledByUserId).toBeNull();
    });

    it("sets the fee record status to READY_TO_KEY and updates the 'lastUpdatedBy...' fields", () => {
      // Arrange
      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
        .withStatus(FEE_RECORD_STATUS.RECONCILED)
        .withLastUpdatedByIsSystemUser(true)
        .withLastUpdatedByPortalUserId(null)
        .withLastUpdatedByTfmUserId(null)
        .build();

      // Act
      feeRecord.markAsReadyToKey({ requestSource: { platform: 'TFM', userId: 'abc123' } });

      // Assert
      expect(feeRecord.status).toBe(FEE_RECORD_STATUS.READY_TO_KEY);
      expect(feeRecord.lastUpdatedByIsSystemUser).toBe(false);
      expect(feeRecord.lastUpdatedByPortalUserId).toBeNull();
      expect(feeRecord.lastUpdatedByTfmUserId).toBe('abc123');
    });
  });
});
