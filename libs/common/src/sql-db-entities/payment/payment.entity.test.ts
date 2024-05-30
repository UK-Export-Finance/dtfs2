import { PaymentAndFeeRecordCurrencyDoesNotMatchError, PaymentHasNoFeeRecordsError } from '../../errors';
import { FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, UtilisationReportEntityMockBuilder } from '../../test-helpers';

describe('PaymentEntity', () => {
  describe('feeRecordsMatchPayment', () => {
    it('throws the PaymentHasNoFeeRecordsError if the fee records array is empty', () => {
      // Arrange
      const PAYMENT_WITH_NO_FEE_RECORDS = PaymentEntityMockBuilder.forCurrency('GBP').withFeeRecords([]).build();

      // Act / Assert
      expect(() => PAYMENT_WITH_NO_FEE_RECORDS.feeRecordsMatchPayment()).toThrow(PaymentHasNoFeeRecordsError);
    });

    describe('when there is only one fee record', () => {
      it('throws the PaymentAndFeeRecordCurrencyDoesNotMatchError when the fee record currency does not match the payment currency', () => {
        // Arrange
        const FEE_RECORD_WITH_EUROS_PAYMENT_CURRENCY = FeeRecordEntityMockBuilder.forReport(aUtilisationReport()).withPaymentCurrency('EUR').build();

        const PAYMENT_WITH_GBP_CURRENCY = PaymentEntityMockBuilder.forCurrency('GBP').withFeeRecords([FEE_RECORD_WITH_EUROS_PAYMENT_CURRENCY]).build();

        // Act / Assert
        expect(() => PAYMENT_WITH_GBP_CURRENCY.feeRecordsMatchPayment()).toThrow(PaymentAndFeeRecordCurrencyDoesNotMatchError);
      });

      it('returns true when the fee record feesPaidToUkefForThePeriod amount in the payment currency matches the payment amount', () => {
        // Arrange
        const FEES_PAID_IN_EUROS = 100;
        const FEE_RECORD_WITH_EUROS_PAYMENT_CURRENCY = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withPaymentCurrency('EUR')
          .withFeesPaidToUkefForThePeriodCurrency('EUR')
          .withFeesPaidToUkefForThePeriod(FEES_PAID_IN_EUROS)
          .build();

        const PAYMENT_WITH_EUROS_CURRENCY = PaymentEntityMockBuilder.forCurrency('EUR')
          .withAmountReceived(FEES_PAID_IN_EUROS)
          .withFeeRecords([FEE_RECORD_WITH_EUROS_PAYMENT_CURRENCY])
          .build();

        // Act
        const result = PAYMENT_WITH_EUROS_CURRENCY.feeRecordsMatchPayment();

        // Assert
        expect(result).toBe(true);
      });

      it('returns false when the fee record feesPaidToUkefForThePeriod amount in the payment currency does not match the payment amount', () => {
        // Arrange
        const FEE_RECORD_FEES_PAID_IN_EUROS = 100;
        const FEE_RECORD_WITH_EUROS_PAYMENT_CURRENCY = FeeRecordEntityMockBuilder.forReport(aUtilisationReport())
          .withPaymentCurrency('EUR')
          .withFeesPaidToUkefForThePeriodCurrency('EUR')
          .withFeesPaidToUkefForThePeriod(FEE_RECORD_FEES_PAID_IN_EUROS)
          .build();

        const PAYMENT_AMOUNT_IN_EUROS = 120;
        const PAYMENT_WITH_EUROS_CURRENCY = PaymentEntityMockBuilder.forCurrency('EUR')
          .withAmountReceived(PAYMENT_AMOUNT_IN_EUROS)
          .withFeeRecords([FEE_RECORD_WITH_EUROS_PAYMENT_CURRENCY])
          .build();

        // Act
        const result = PAYMENT_WITH_EUROS_CURRENCY.feeRecordsMatchPayment();

        // Assert
        expect(result).toBe(false);
      });
    });

    describe('when there are multiple fee records', () => {
      const UTILISATION_REPORT = aUtilisationReport();

      it('throws the PaymentAndFeeRecordCurrencyDoesNotMatchError when one of the fee record currencies does not match the payment currency', () => {
        // Arrange
        const FEE_RECORD_WITH_EUROS_PAYMENT_CURRENCY = FeeRecordEntityMockBuilder.forReport(UTILISATION_REPORT).withPaymentCurrency('EUR').build();
        const FEE_RECORD_WITH_GBP_PAYMENT_CURRENCY = FeeRecordEntityMockBuilder.forReport(UTILISATION_REPORT).withPaymentCurrency('GBP').build();
        const FEE_RECORDS = [FEE_RECORD_WITH_EUROS_PAYMENT_CURRENCY, FEE_RECORD_WITH_GBP_PAYMENT_CURRENCY];

        const PAYMENT_WITH_GBP_CURRENCY = PaymentEntityMockBuilder.forCurrency('GBP').withFeeRecords(FEE_RECORDS).build();

        // Act / Assert
        expect(() => PAYMENT_WITH_GBP_CURRENCY.feeRecordsMatchPayment()).toThrow(PaymentAndFeeRecordCurrencyDoesNotMatchError);
      });

      it('returns true when the total of the fee record feesPaidToUkefForThePeriod amounts in the payment currency matches the payment amount', () => {
        // Arrange
        const FIRST_FEES_PAID_IN_EUROS = 100;
        const FIRST_FEE_RECORD_WITH_EUROS_PAYMENT_CURRENCY = FeeRecordEntityMockBuilder.forReport(UTILISATION_REPORT)
          .withPaymentCurrency('EUR')
          .withFeesPaidToUkefForThePeriodCurrency('EUR')
          .withFeesPaidToUkefForThePeriod(FIRST_FEES_PAID_IN_EUROS)
          .build();
        const SECOND_FEES_PAID_IN_EUROS = 100;
        const SECOND_FEE_RECORD_WITH_EUROS_PAYMENT_CURRENCY = FeeRecordEntityMockBuilder.forReport(UTILISATION_REPORT)
          .withPaymentCurrency('EUR')
          .withFeesPaidToUkefForThePeriodCurrency('EUR')
          .withFeesPaidToUkefForThePeriod(SECOND_FEES_PAID_IN_EUROS)
          .build();
        const FEE_RECORDS = [FIRST_FEE_RECORD_WITH_EUROS_PAYMENT_CURRENCY, SECOND_FEE_RECORD_WITH_EUROS_PAYMENT_CURRENCY];

        const TOTAL_FEES_PAID_IN_EUROS = FIRST_FEES_PAID_IN_EUROS + SECOND_FEES_PAID_IN_EUROS;

        const PAYMENT_WITH_EUROS_CURRENCY = PaymentEntityMockBuilder.forCurrency('EUR')
          .withAmountReceived(TOTAL_FEES_PAID_IN_EUROS)
          .withFeeRecords(FEE_RECORDS)
          .build();

        // Act
        const result = PAYMENT_WITH_EUROS_CURRENCY.feeRecordsMatchPayment();

        // Assert
        expect(result).toBe(true);
      });

      it('returns false when the total of the fee record feesPaidToUkefForThePeriod amounts in the payment currency does not match the payment amount', () => {
        // Arrange
        const FIRST_FEES_PAID_IN_EUROS = 100;
        const FIRST_FEE_RECORD_WITH_EUROS_PAYMENT_CURRENCY = FeeRecordEntityMockBuilder.forReport(UTILISATION_REPORT)
          .withPaymentCurrency('EUR')
          .withFeesPaidToUkefForThePeriodCurrency('EUR')
          .withFeesPaidToUkefForThePeriod(FIRST_FEES_PAID_IN_EUROS)
          .build();
        const SECOND_FEES_PAID_IN_EUROS = 100;
        const SECOND_FEE_RECORD_WITH_EUROS_PAYMENT_CURRENCY = FeeRecordEntityMockBuilder.forReport(UTILISATION_REPORT)
          .withPaymentCurrency('EUR')
          .withFeesPaidToUkefForThePeriodCurrency('EUR')
          .withFeesPaidToUkefForThePeriod(SECOND_FEES_PAID_IN_EUROS)
          .build();
        const FEE_RECORDS = [FIRST_FEE_RECORD_WITH_EUROS_PAYMENT_CURRENCY, SECOND_FEE_RECORD_WITH_EUROS_PAYMENT_CURRENCY];

        const TOTAL_FEES_PAID_IN_EUROS = FIRST_FEES_PAID_IN_EUROS + SECOND_FEES_PAID_IN_EUROS;

        const PAYMENT_AMOUNT_IN_EUROS = TOTAL_FEES_PAID_IN_EUROS + 120;
        const PAYMENT_WITH_EUROS_CURRENCY = PaymentEntityMockBuilder.forCurrency('EUR')
          .withAmountReceived(PAYMENT_AMOUNT_IN_EUROS)
          .withFeeRecords(FEE_RECORDS)
          .build();

        // Act
        const result = PAYMENT_WITH_EUROS_CURRENCY.feeRecordsMatchPayment();

        // Assert
        expect(result).toBe(false);
      });
    });

    function aUtilisationReport() {
      return UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();
    }
  });
});
