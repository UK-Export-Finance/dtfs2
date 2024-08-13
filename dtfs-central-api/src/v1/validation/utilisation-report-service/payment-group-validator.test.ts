import {
  FeeRecordEntity,
  FeeRecordEntityMockBuilder,
  InvalidPayloadError,
  PaymentEntity,
  PaymentEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import {
  validateProvidedPaymentIdsMatchFirstPaymentsFirstFeeRecordPaymentIds,
  validatePaymentGroupPaymentsAllHaveSameFeeRecords,
} from './payment-group-validator';

describe('payment group validator', () => {
  const report = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').build();

  describe('validatePaymentGroupPaymentsAllHaveSameFeeRecords', () => {
    it('should not throw an error when there is only one payment', () => {
      // Arrange
      const aListOfOnePaymentWithFeeRecords = [aPaymentWithIdAndFeeRecords(1, [aFeeRecordWithId(1), aFeeRecordWithId(2)])];

      // Act & Assert
      expect(() => validatePaymentGroupPaymentsAllHaveSameFeeRecords(aListOfOnePaymentWithFeeRecords)).not.toThrow();
    });

    it('should not throw an error when all payments have the same fee records', () => {
      // Arrange
      const aListOfPaymentsWithMatchingFeeRecords = [
        aPaymentWithIdAndFeeRecords(1, [aFeeRecordWithId(1), aFeeRecordWithId(2)]),
        aPaymentWithIdAndFeeRecords(2, [aFeeRecordWithId(1), aFeeRecordWithId(2)]),
      ];

      // Act & Assert
      expect(() => validatePaymentGroupPaymentsAllHaveSameFeeRecords(aListOfPaymentsWithMatchingFeeRecords)).not.toThrow();
    });

    it('should throw an InvalidPayloadError when payments have different fee record lengths', () => {
      // Arrange
      const aListOfPaymentsWithAnUnequalFeeRecordCount = [
        aPaymentWithIdAndFeeRecords(1, [aFeeRecordWithId(1), aFeeRecordWithId(2)]),
        aPaymentWithIdAndFeeRecords(2, [aFeeRecordWithId(1)]),
      ];

      // Act & Assert
      expect(() => validatePaymentGroupPaymentsAllHaveSameFeeRecords(aListOfPaymentsWithAnUnequalFeeRecordCount)).toThrow(
        new InvalidPayloadError('Payment group payments must all have the same set of fee records attached.'),
      );
    });

    it('should throw an InvalidPayloadError when payments have different fee record ids', () => {
      // Arrange
      const aListOfPaymentsWithFeeRecordsOfDifferingIds = [
        aPaymentWithIdAndFeeRecords(1, [aFeeRecordWithId(1), aFeeRecordWithId(2)]),
        aPaymentWithIdAndFeeRecords(2, [aFeeRecordWithId(1), aFeeRecordWithId(3)]),
      ];

      // Act & Assert
      expect(() => validatePaymentGroupPaymentsAllHaveSameFeeRecords(aListOfPaymentsWithFeeRecordsOfDifferingIds)).toThrow(
        new InvalidPayloadError('Payment group payments must all have the same set of fee records attached.'),
      );
    });
  });

  describe('validateProvidedPaymentIdsMatchFirstPaymentsFirstFeeRecordPaymentIds', () => {
    it('should not throw an error when payments array is empty', () => {
      // Arrange
      const anEmptyListOfPayments: PaymentEntity[] = [];
      const paymentIds = [1];

      // Act & Assert
      expect(() => validateProvidedPaymentIdsMatchFirstPaymentsFirstFeeRecordPaymentIds(anEmptyListOfPayments, paymentIds)).not.toThrow();
    });

    it('should not throw an error when first payment has no fee records', () => {
      // Arrange
      const paymentsWithNoFeeRecords = [aPaymentWithIdAndFeeRecords(1, [])];
      const paymentIds = [1];

      // Act & Assert
      expect(() => validateProvidedPaymentIdsMatchFirstPaymentsFirstFeeRecordPaymentIds(paymentsWithNoFeeRecords, paymentIds)).not.toThrow();
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
      expect(() => validateProvidedPaymentIdsMatchFirstPaymentsFirstFeeRecordPaymentIds(aListOfOnePaymentWithFeeRecordsWithPayments, paymentIds)).not.toThrow();
    });

    it('should throw an InvalidPayloadError when payment count does not match first fee record payment count', () => {
      // Arrange
      const payments = [aPaymentWithIdAndFeeRecords(1, [aFeeRecordWithId(1), aFeeRecordWithId(2)])];
      const paymentIds = [1, 2, 3];

      // Act & Assert
      expect(() => validateProvidedPaymentIdsMatchFirstPaymentsFirstFeeRecordPaymentIds(payments, paymentIds)).toThrow(
        new InvalidPayloadError('Payment group payment count must equal the number of payments attached to the first fee record of the first payment.'),
      );
    });

    it('should throw an InvalidPayloadError when payment IDs do not match first fee record payment IDs', () => {
      // Arrange
      const payments = [aPaymentWithIdAndFeeRecords(1, [aFeeRecordWithId(1), aFeeRecordWithId(2)])];
      const paymentIds = [1, 3];

      // Act & Assert
      expect(() => validateProvidedPaymentIdsMatchFirstPaymentsFirstFeeRecordPaymentIds(payments, paymentIds)).toThrow(
        new InvalidPayloadError('Payment group payment count must equal the number of payments attached to the first fee record of the first payment.'),
      );
    });
  });

  function aPaymentWithIdAndFeeRecords(id: number, feeRecords: FeeRecordEntity[]) {
    return PaymentEntityMockBuilder.forCurrency('GBP').withId(id).withFeeRecords(feeRecords).build();
  }

  function aFeeRecordWithId(id: number) {
    return FeeRecordEntityMockBuilder.forReport(report).withId(id).build();
  }
});
