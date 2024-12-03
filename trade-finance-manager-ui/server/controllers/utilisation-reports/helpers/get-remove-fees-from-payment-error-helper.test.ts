import { RemoveFeesFromPaymentErrorKey, getRemoveFeesFromPaymentError } from './get-remove-fees-from-payment-error-helper';

describe('get-remove-fees-from-payment-error-helper', () => {
  describe('getRemoveFeesFromPaymentError', () => {
    it("sets error summary to a single error with text and href when the payment error key is 'no-fee-records-selected'", () => {
      // Arrange
      const removeFeesFromPaymentErrorKey: RemoveFeesFromPaymentErrorKey = 'no-fee-records-selected';

      // Act
      const errors = getRemoveFeesFromPaymentError(removeFeesFromPaymentErrorKey);

      // Assert
      expect(errors.errorSummary).toHaveLength(1);
      expect(errors.errorSummary[0].text).toEqual('Select fee or fees to remove from the payment');
      expect(errors.errorSummary[0].href).toEqual('#added-reported-fees-details-header');
    });

    it("sets remove selected fees error message when the payment error key is 'no-fee-records-selected'", () => {
      // Arrange
      const removeFeesFromPaymentErrorKey: RemoveFeesFromPaymentErrorKey = 'no-fee-records-selected';

      // Act
      const errors = getRemoveFeesFromPaymentError(removeFeesFromPaymentErrorKey);

      // Assert
      expect(errors.removeSelectedFeesErrorMessage).toEqual('Select fee or fees to remove from the payment');
    });

    it("sets error summary to a single error with text and href when the payment error key is 'all-fee-records-selected'", () => {
      // Arrange
      const removeFeesFromPaymentErrorKey: RemoveFeesFromPaymentErrorKey = 'all-fee-records-selected';

      // Act
      const errors = getRemoveFeesFromPaymentError(removeFeesFromPaymentErrorKey);

      // Assert
      expect(errors.errorSummary).toHaveLength(1);
      expect(errors.errorSummary[0].text).toEqual('You cannot remove all the fees. Delete the payment instead.');
      expect(errors.errorSummary[0].href).toEqual('#added-reported-fees-details-header');
    });

    it("sets remove selected fees error message whe the payment error key is 'all-fee-records-selected'", () => {
      // Arrange
      const removeFeesFromPaymentErrorKey: RemoveFeesFromPaymentErrorKey = 'all-fee-records-selected';

      // Act
      const error = getRemoveFeesFromPaymentError(removeFeesFromPaymentErrorKey);

      // Assert
      expect(error.removeSelectedFeesErrorMessage).toEqual('You cannot remove all the fees. Delete the payment instead.');
    });
  });
});
