import { RemoveFeesFromPaymentGroupErrorKey, getRemoveFeesFromPaymentGroupError } from './get-remove-fees-from-payment-group-error-helper';

describe('get-remove-fees-from-payment-group-error-helper', () => {
  describe('getRemoveFeesFromPaymentGroupError', () => {
    it("returns an array containing a single object containing the error text and href when the payment error key is 'no-fee-records-selected'", () => {
      // Arrange
      const removeFeesFromPaymentGroupErrorKey: RemoveFeesFromPaymentGroupErrorKey = 'no-fee-records-selected';

      // Act
      const removeFeesFromPaymentGroupError = getRemoveFeesFromPaymentGroupError(removeFeesFromPaymentGroupErrorKey);

      // Assert
      expect(removeFeesFromPaymentGroupError).toHaveLength(1);
      expect(removeFeesFromPaymentGroupError[0].text).toBe('Select fee or fees to remove from the payment');
      expect(removeFeesFromPaymentGroupError[0].href).toBe('#added-reported-fees-details-header');
    });

    it("returns an array containing a single object containing the error text and href when the payment error key is 'all-fee-records-selected'", () => {
      // Arrange
      const removeFeesFromPaymentGroupErrorKey: RemoveFeesFromPaymentGroupErrorKey = 'all-fee-records-selected';

      // Act
      const removeFeesFromPaymentGroupError = getRemoveFeesFromPaymentGroupError(removeFeesFromPaymentGroupErrorKey);

      // Assert
      expect(removeFeesFromPaymentGroupError).toHaveLength(1);
      expect(removeFeesFromPaymentGroupError[0].text).toBe('You cannot remove all the fees. Delete the payment instead.');
      expect(removeFeesFromPaymentGroupError[0].href).toBe('#added-reported-fees-details-header');
    });
  });
});
