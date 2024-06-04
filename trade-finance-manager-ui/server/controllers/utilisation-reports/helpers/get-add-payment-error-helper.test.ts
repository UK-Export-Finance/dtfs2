import { AddPaymentErrorKey, getAddPaymentError } from './get-add-payment-error-helper';

describe('get-add-payment-error-helper', () => {
  describe('getAddPaymentError', () => {
    it("returns an array containing a single object containing the error text and href when the payment error key is 'no-fee-records-selected'", () => {
      // Arrange
      const addPaymentErrorKey: AddPaymentErrorKey = 'no-fee-records-selected';

      // Act
      const addPaymentError = getAddPaymentError(addPaymentErrorKey);

      // Assert
      expect(addPaymentError).toHaveLength(1);
      expect(addPaymentError[0].text).toBe('Select a fee or fees to add a payment to');
      expect(addPaymentError[0].href).toBe('#no-fee-records-selected');
    });

    it("returns an array containing a single object containing the error text and href when the payment error key is 'different-fee-record-statuses'", () => {
      // Arrange
      const addPaymentErrorKey: AddPaymentErrorKey = 'different-fee-record-statuses';

      // Act
      const addPaymentError = getAddPaymentError(addPaymentErrorKey);

      // Assert
      expect(addPaymentError).toHaveLength(1);
      expect(addPaymentError[0].text).toBe('Select a fee or fees with the same status');
      expect(addPaymentError[0].href).toBe('#different-fee-record-statuses');
    });

    it("returns an array containing a single object containing the error text and href when the payment error key is 'different-fee-record-payment-currencies'", () => {
      // Arrange
      const addPaymentErrorKey: AddPaymentErrorKey = 'different-fee-record-payment-currencies';

      // Act
      const addPaymentError = getAddPaymentError(addPaymentErrorKey);

      // Assert
      expect(addPaymentError).toHaveLength(1);
      expect(addPaymentError[0].text).toBe('Select fees with the same Reported payment currency');
      expect(addPaymentError[0].href).toBe('#different-fee-record-payment-currencies');
    });

    it("returns an array containing a single object containing the error text and href when the payment error key is 'multiple-does-not-match-selected'", () => {
      // Arrange
      const addPaymentErrorKey: AddPaymentErrorKey = 'multiple-does-not-match-selected';

      // Act
      const addPaymentError = getAddPaymentError(addPaymentErrorKey);

      // Assert
      expect(addPaymentError).toHaveLength(1);
      expect(addPaymentError[0].text).toBe("Select only one fee or fee group at 'Does not match' status");
      expect(addPaymentError[0].href).toBe('#multiple-does-not-match-selected');
    });
  });
});
