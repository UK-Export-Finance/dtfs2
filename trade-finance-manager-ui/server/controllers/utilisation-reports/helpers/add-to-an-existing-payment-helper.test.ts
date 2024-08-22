import { SelectedFeeRecordsAvailablePaymentDetails, SelectedFeeRecordsAvailablePaymentGroups } from '@ukef/dtfs2-common';
import { getAvailablePaymentsHeading } from './add-to-an-existing-payment-helper';

describe('add-to-an-existing-payment-helper', () => {
  describe('getAvailablePaymentsHeading', () => {
    it('should return "one existing payment" heading for a single payment', () => {
      // Arrange
      const paymentGroups: SelectedFeeRecordsAvailablePaymentGroups = [[aSelectedFeeRecordsAvailablePaymentDetails()]];

      // Act
      const result = getAvailablePaymentsHeading(paymentGroups);

      // Assert
      expect(result).toBe('There is one existing payment that the reported fees will be added to');
    });

    it('should return "one existing group of payments" heading for a single group of payments', () => {
      // Arrange
      const paymentGroups: SelectedFeeRecordsAvailablePaymentGroups = [
        [aSelectedFeeRecordsAvailablePaymentDetails(), aSelectedFeeRecordsAvailablePaymentDetails()],
      ];

      // Act
      const result = getAvailablePaymentsHeading(paymentGroups);

      // Assert
      expect(result).toBe('There is one existing group of payments that the reported fees will be added to');
    });

    it('should return "which payment" heading for multiple single payments', () => {
      // Arrange
      const paymentGroups: SelectedFeeRecordsAvailablePaymentGroups = [
        [aSelectedFeeRecordsAvailablePaymentDetails()],
        [aSelectedFeeRecordsAvailablePaymentDetails()],
        [aSelectedFeeRecordsAvailablePaymentDetails()],
      ];

      // Act
      const result = getAvailablePaymentsHeading(paymentGroups);

      // Assert
      expect(result).toBe('Which payment do you want to add the reported fees to?');
    });

    it('should return "group of payments" heading for multiple groups of payments', () => {
      // Arrange
      const paymentGroups: SelectedFeeRecordsAvailablePaymentGroups = [
        [aSelectedFeeRecordsAvailablePaymentDetails(), aSelectedFeeRecordsAvailablePaymentDetails()],
        [aSelectedFeeRecordsAvailablePaymentDetails(), aSelectedFeeRecordsAvailablePaymentDetails()],
        [aSelectedFeeRecordsAvailablePaymentDetails(), aSelectedFeeRecordsAvailablePaymentDetails()],
      ];

      // Act
      const result = getAvailablePaymentsHeading(paymentGroups);

      // Assert
      expect(result).toBe('Which group of payments do you want to add the reported fees to?');
    });

    it('should return "payment or group of payments" heading for mix of single payments and groups', () => {
      // Arrange
      const paymentGroups: SelectedFeeRecordsAvailablePaymentGroups = [
        [aSelectedFeeRecordsAvailablePaymentDetails()],
        [aSelectedFeeRecordsAvailablePaymentDetails(), aSelectedFeeRecordsAvailablePaymentDetails()],
        [aSelectedFeeRecordsAvailablePaymentDetails()],
        [aSelectedFeeRecordsAvailablePaymentDetails(), aSelectedFeeRecordsAvailablePaymentDetails(), aSelectedFeeRecordsAvailablePaymentDetails()],
      ];

      // Act
      const result = getAvailablePaymentsHeading(paymentGroups);

      // Assert
      expect(result).toBe('Which payment or group of payments do you want to add the reported fees to?');
    });

    function aSelectedFeeRecordsAvailablePaymentDetails(): SelectedFeeRecordsAvailablePaymentDetails {
      return {
        amount: 1000,
        currency: 'JPY',
        id: 1,
        reference: 'REF001',
      };
    }
  });
});
