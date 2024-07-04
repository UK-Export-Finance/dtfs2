import { UnlinkPaymentFeesErrorKey, getUnlinkPaymentFeesError } from './get-unlink-payment-fees-error-helper';

describe('get-unlink-payment-fees-error-helper', () => {
  describe('getUnlinkPaymentFeesError', () => {
    it("returns an array containing a single object containing the error text and href when the payment error key is 'no-fee-records-selected'", () => {
      // Arrange
      const unlinkPaymentFeesErrorKey: UnlinkPaymentFeesErrorKey = 'no-fee-records-selected';

      // Act
      const unlinkPaymentFeesError = getUnlinkPaymentFeesError(unlinkPaymentFeesErrorKey);

      // Assert
      expect(unlinkPaymentFeesError).toHaveLength(1);
      expect(unlinkPaymentFeesError[0].text).toBe('Select fee or fees to remove from the payment');
      expect(unlinkPaymentFeesError[0].href).toBe('#addedReportedFeesDetails');
    });

    it("returns an array containing a single object containing the error text and href when the payment error key is 'all-fee-records-selected'", () => {
      // Arrange
      const unlinkPaymentFeesErrorKey: UnlinkPaymentFeesErrorKey = 'all-fee-records-selected';

      // Act
      const unlinkPaymentFeesError = getUnlinkPaymentFeesError(unlinkPaymentFeesErrorKey);

      // Assert
      expect(unlinkPaymentFeesError).toHaveLength(1);
      expect(unlinkPaymentFeesError[0].text).toBe('You cannot remove all the fees. Delete the payment instead.');
      expect(unlinkPaymentFeesError[0].href).toBe('#addedReportedFeesDetails');
    });
  });
});
