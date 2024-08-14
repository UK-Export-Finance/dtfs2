import {
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  InvalidPayloadError,
  PaymentEntity,
  PaymentEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import {
  validateThatSelectedPaymentsFormACompletePaymentGroup,
  validateThatSelectedPaymentsBelongToSamePaymentGroup,
  validateThatPaymentGroupHasFeeRecords,
} from './payment-group-validator';

describe('payment group validator', () => {
  const report = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

  describe('validateThatSelectedPaymentsBelongToSamePaymentGroup', () => {
    it('should not throw an error when there is only one payment', () => {
      // Arrange
      const aListOfOnePaymentWithFeeRecords = [aPaymentWithIdAndFeeRecords(1, [aFeeRecordWithId(1), aFeeRecordWithId(2)])];

      // Act & Assert
      expect(() => validateThatSelectedPaymentsBelongToSamePaymentGroup(aListOfOnePaymentWithFeeRecords)).not.toThrow();
    });

    it('should not throw an error when all payments have the same fee records', () => {
      // Arrange
      const aListOfPaymentsWithMatchingFeeRecords = [
        aPaymentWithIdAndFeeRecords(1, [aFeeRecordWithId(1), aFeeRecordWithId(2)]),
        aPaymentWithIdAndFeeRecords(2, [aFeeRecordWithId(1), aFeeRecordWithId(2)]),
      ];

      // Act & Assert
      expect(() => validateThatSelectedPaymentsBelongToSamePaymentGroup(aListOfPaymentsWithMatchingFeeRecords)).not.toThrow();
    });

    it('should throw an InvalidPayloadError when payments have different fee record lengths', () => {
      // Arrange
      const aListOfPaymentsWithAnUnequalFeeRecordCount = [
        aPaymentWithIdAndFeeRecords(1, [aFeeRecordWithId(1), aFeeRecordWithId(2)]),
        aPaymentWithIdAndFeeRecords(2, [aFeeRecordWithId(1)]),
      ];

      // Act & Assert
      expect(() => validateThatSelectedPaymentsBelongToSamePaymentGroup(aListOfPaymentsWithAnUnequalFeeRecordCount)).toThrow(
        new InvalidPayloadError('Selected payments do not all belong to same payment group.'),
      );
    });

    it('should throw an InvalidPayloadError when payments have different fee record ids', () => {
      // Arrange
      const aListOfPaymentsWithFeeRecordsOfDifferingIds = [
        aPaymentWithIdAndFeeRecords(1, [aFeeRecordWithId(1), aFeeRecordWithId(2)]),
        aPaymentWithIdAndFeeRecords(2, [aFeeRecordWithId(1), aFeeRecordWithId(3)]),
      ];

      // Act & Assert
      expect(() => validateThatSelectedPaymentsBelongToSamePaymentGroup(aListOfPaymentsWithFeeRecordsOfDifferingIds)).toThrow(
        new InvalidPayloadError('Selected payments do not all belong to same payment group.'),
      );
    });
  });

  describe('validateThatSelectedPaymentsFormACompletePaymentGroup', () => {
    it('should not throw an error when payments array is empty', () => {
      // Arrange
      const anEmptyListOfPayments: PaymentEntity[] = [];
      const paymentIds = [1];

      // Act & Assert
      expect(() => validateThatSelectedPaymentsFormACompletePaymentGroup(anEmptyListOfPayments, paymentIds)).not.toThrow();
    });

    it('should not throw an error when first payment has no fee records', () => {
      // Arrange
      const paymentsWithNoFeeRecords = [aPaymentWithIdAndFeeRecords(1, [])];
      const paymentIds = [1];

      // Act & Assert
      expect(() => validateThatSelectedPaymentsFormACompletePaymentGroup(paymentsWithNoFeeRecords, paymentIds)).not.toThrow();
    });

    it('should not throw an error when payment IDs match first fee record payment IDs', () => {
      // Arrange
      const aFeeRecord = FeeRecordEntityMockBuilder.forReport(report)
        .withId(2)
        .withPayments([aPaymentWithIdAndFeeRecords(1, [])])
        .build();
      const aListOfOnePaymentWithFeeRecordsWithPayments = [aPaymentWithIdAndFeeRecords(1, [aFeeRecord])];
      const paymentIds = [1];

      // Act & Assert
      expect(() => validateThatSelectedPaymentsFormACompletePaymentGroup(aListOfOnePaymentWithFeeRecordsWithPayments, paymentIds)).not.toThrow();
    });

    it('should throw an InvalidPayloadError when payment count does not match first fee record payment count', () => {
      // Arrange
      const payments = [aPaymentWithIdAndFeeRecords(1, [aFeeRecordWithId(1), aFeeRecordWithId(2)])];
      const paymentIds = [1, 2, 3];

      // Act & Assert
      expect(() => validateThatSelectedPaymentsFormACompletePaymentGroup(payments, paymentIds)).toThrow(
        new InvalidPayloadError('Selected payment count does not match the payment group size.'),
      );
    });

    it('should throw an InvalidPayloadError when payment IDs do not match first fee record payment IDs', () => {
      // Arrange
      const payments = [aPaymentWithIdAndFeeRecords(1, [aFeeRecordWithId(1), aFeeRecordWithId(2)])];
      const paymentIds = [1, 3];

      // Act & Assert
      expect(() => validateThatSelectedPaymentsFormACompletePaymentGroup(payments, paymentIds)).toThrow(
        new InvalidPayloadError('Selected payment count does not match the payment group size.'),
      );
    });
  });

  describe('validateThatPaymentGroupHasFeeRecords', () => {
    it('should throw an InvalidPayloadError when payment group fee records are undefined', () => {
      // Arrange
      const paymentGroupFeeRecords = undefined;

      // Act & Assert
      expect(() => validateThatPaymentGroupHasFeeRecords(paymentGroupFeeRecords)).toThrow(new InvalidPayloadError('The payment group has no fee records.'));
    });

    it('should throw an InvalidPayloadError when payment group has no fee records', () => {
      // Arrange
      const paymentGroupFeeRecords: FeeRecordEntity[] = [];

      // Act & Assert
      expect(() => validateThatPaymentGroupHasFeeRecords(paymentGroupFeeRecords)).toThrow(new InvalidPayloadError('The payment group has no fee records.'));
    });

    it('should not throw an error when payment group has fee records', () => {
      // Arrange
      const paymentGroupFeeRecords = [aFeeRecordWithId(1), aFeeRecordWithId(2)];

      // Act & Assert
      expect(() => validateThatPaymentGroupHasFeeRecords(paymentGroupFeeRecords)).not.toThrow();
    });
  });

  function aPaymentWithIdAndFeeRecords(id: number, feeRecords: FeeRecordEntity[]) {
    return PaymentEntityMockBuilder.forCurrency('GBP').withId(id).withFeeRecords(feeRecords).build();
  }

  function aFeeRecordWithId(id: number) {
    return FeeRecordEntityMockBuilder.forReport(report).withId(id).build();
  }
});
