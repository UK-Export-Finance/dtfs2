import { Currency, FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { feeRecordsAndPaymentsMatch } from './fee-record-matching';

describe('fee-record-matching', () => {
  describe('feeRecordsAndPaymentsMatch', () => {
    it('returns true when the payments attached to the fee records have the same total payments', () => {
      // Arrange
      const paymentCurrency: Currency = 'GBP';
      const firstFeeRecordAmount = 100;
      const secondFeeRecordAmount = 50;
      const firstPaymentAmount = 30;
      const secondPaymentAmount = 120;

      const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withId(1)
          .withPaymentCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriod(firstFeeRecordAmount)
          .build(),
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withId(2)
          .withPaymentCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriod(secondFeeRecordAmount)
          .build(),
      ];

      const payments = [
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(1).withAmount(firstPaymentAmount).build(),
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(2).withAmount(secondPaymentAmount).build(),
      ];

      // Act
      const result = feeRecordsAndPaymentsMatch(feeRecords, payments);

      // Assert
      expect(result).toBe(true);
    });

    it('returns false when the payments attached to the fee records do not have the same total payments', () => {
      // Arrange
      const paymentCurrency: Currency = 'GBP';
      const firstFeeRecordAmount = 100;
      const secondFeeRecordAmount = 50;
      const firstPaymentAmount = 30;
      const secondPaymentAmount = 100;

      const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withId(1)
          .withPaymentCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriod(firstFeeRecordAmount)
          .build(),
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withId(2)
          .withPaymentCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
          .withFeesPaidToUkefForThePeriod(secondFeeRecordAmount)
          .build(),
      ];

      const payments = [
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(1).withAmount(firstPaymentAmount).build(),
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(2).withAmount(secondPaymentAmount).build(),
      ];

      // Act
      const result = feeRecordsAndPaymentsMatch(feeRecords, payments);

      // Assert
      expect(result).toBe(false);
    });

    it('returns true when the payments attached to the fee records have the same total payments when converted to the payment currency', () => {
      // Arrange
      const feesPaidToUkefForThePeriodCurrency: Currency = 'EUR';
      const paymentExchangeRate = 1.1;
      const firstFeeRecordAmount = 100; // = 90.91 GBP
      const secondFeeRecordAmount = 50; // = 45.45 GBP

      const paymentCurrency: Currency = 'GBP';
      const firstPaymentAmount = 30;
      const secondPaymentAmount = 106.36;

      const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withId(1)
          .withPaymentCurrency(paymentCurrency)
          .withPaymentExchangeRate(paymentExchangeRate)
          .withFeesPaidToUkefForThePeriodCurrency(feesPaidToUkefForThePeriodCurrency)
          .withFeesPaidToUkefForThePeriod(firstFeeRecordAmount)
          .build(),
        FeeRecordEntityMockBuilder.forReport(utilisationReport)
          .withId(2)
          .withPaymentCurrency(paymentCurrency)
          .withPaymentExchangeRate(paymentExchangeRate)
          .withFeesPaidToUkefForThePeriodCurrency(feesPaidToUkefForThePeriodCurrency)
          .withFeesPaidToUkefForThePeriod(secondFeeRecordAmount)
          .build(),
      ];

      const payments = [
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(1).withAmount(firstPaymentAmount).build(),
        PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(2).withAmount(secondPaymentAmount).build(),
      ];

      // Act
      const result = feeRecordsAndPaymentsMatch(feeRecords, payments);

      // Assert
      expect(result).toBe(true);
    });
  });
});
