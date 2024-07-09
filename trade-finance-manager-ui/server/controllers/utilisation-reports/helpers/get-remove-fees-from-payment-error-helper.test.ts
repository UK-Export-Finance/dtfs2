import { RemoveFeesFromPaymentErrorKey, getRemoveFeesFromPaymentError } from './get-remove-fees-from-payment-error-helper';

describe('get-remove-fees-from-payment-error-helper', () => {
  describe('getRemoveFeesFromPaymentError', () => {
    it("returns an array containing a single object containing the error text and href when the payment error key is 'no-fee-records-selected'", () => {
      // Arrange
      const removeFeesFromPaymentErrorKey: RemoveFeesFromPaymentErrorKey = 'no-fee-records-selected';

      // Act
      const removeFeesFromPaymentError = getRemoveFeesFromPaymentError(removeFeesFromPaymentErrorKey);

      // Assert
      expect(removeFeesFromPaymentError).toHaveLength(1);
      expect(removeFeesFromPaymentError[0].text).toBe('Select fee or fees to remove from the payment');
      expect(removeFeesFromPaymentError[0].href).toBe('#added-reported-fees-details-header');
    });

    it("returns an array containing a single object containing the error text and href when the payment error key is 'all-fee-records-selected'", () => {
      // Arrange
      const removeFeesFromPaymentErrorKey: RemoveFeesFromPaymentErrorKey = 'all-fee-records-selected';

      // Act
      const removeFeesFromPaymentError = getRemoveFeesFromPaymentError(removeFeesFromPaymentErrorKey);

      // Assert
      expect(removeFeesFromPaymentError).toHaveLength(1);
      expect(removeFeesFromPaymentError[0].text).toBe('You cannot remove all the fees. Delete the payment instead.');
      expect(removeFeesFromPaymentError[0].href).toBe('#added-reported-fees-details-header');
    });
  });
});
