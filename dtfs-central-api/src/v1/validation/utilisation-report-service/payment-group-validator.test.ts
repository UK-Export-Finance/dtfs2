import {
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  InvalidPayloadError,
  PaymentEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { validateThatRequestedPaymentsMatchSavedPayments, validateThatPaymentGroupHasFeeRecords } from './payment-group-validator';

describe('payment group validator', () => {
  const report = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

  describe('validateThatRequestedPaymentsMatchSavedPayments', () => {
    it('should not throw an error when requested payment IDs match saved payment IDs', () => {
      // Arrange
      const savedPayments = [aPaymentWithId(1), aPaymentWithId(2)];
      const requestedPaymentIds = [1, 2];

      // Act & Assert
      expect(() => validateThatRequestedPaymentsMatchSavedPayments(savedPayments, requestedPaymentIds)).not.toThrow();
    });

    it('should throw an InvalidPayloadError when requested payment IDs do not match saved payment IDs', () => {
      // Arrange
      const savedPayments = [aPaymentWithId(1), aPaymentWithId(2)];
      const requestedPaymentIds = [1, 3];

      // Act & Assert
      expect(() => validateThatRequestedPaymentsMatchSavedPayments(savedPayments, requestedPaymentIds)).toThrow(
        new InvalidPayloadError('Requested payment IDs do not match saved payment IDs'),
      );
    });

    it('should throw an InvalidPayloadError when there are missing requested payment IDs', () => {
      // Arrange
      const savedPayments = [aPaymentWithId(1), aPaymentWithId(2)];
      const requestedPaymentIds = [1];

      // Act & Assert
      expect(() => validateThatRequestedPaymentsMatchSavedPayments(savedPayments, requestedPaymentIds)).toThrow(
        new InvalidPayloadError('Requested payment IDs do not match saved payment IDs'),
      );
    });

    it('should throw an InvalidPayloadError when there are extra requested payment IDs', () => {
      // Arrange
      const savedPayments = [aPaymentWithId(1), aPaymentWithId(2)];
      const requestedPaymentIds = [1, 2, 3];

      // Act & Assert
      expect(() => validateThatRequestedPaymentsMatchSavedPayments(savedPayments, requestedPaymentIds)).toThrow(
        new InvalidPayloadError('Requested payment IDs do not match saved payment IDs'),
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
      const paymentGroupFeeRecords = [
        FeeRecordEntityMockBuilder.forReport(report).withId(1).build(),
        FeeRecordEntityMockBuilder.forReport(report).withId(2).build(),
      ];

      // Act & Assert
      expect(() => validateThatPaymentGroupHasFeeRecords(paymentGroupFeeRecords)).not.toThrow();
    });
  });

  function aPaymentWithId(id: number) {
    return PaymentEntityMockBuilder.forCurrency('GBP').withId(id).build();
  }
});
