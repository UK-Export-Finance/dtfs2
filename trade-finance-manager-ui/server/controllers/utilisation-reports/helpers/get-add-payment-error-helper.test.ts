import { AddPaymentErrorKey, getAddPaymentError } from './get-add-payment-error-helper';

describe('get-add-payment-error-helper', () => {
  describe('getAddPaymentError', () => {
    it("returns the error text and href when the payment error key is 'no-fee-records-selected'", () => {
      // Arrange
      const addPaymentErrorKey: AddPaymentErrorKey = 'no-fee-records-selected';

      // Act
      const addPaymentError = getAddPaymentError(addPaymentErrorKey);

      // Assert
      expect(addPaymentError.text).toEqual('Select a fee or fees to add a payment to');
      expect(addPaymentError.href).toEqual('#premium-payments-table');
    });

    it("returns the error text and href when the payment error key is 'different-fee-record-statuses'", () => {
      // Arrange
      const addPaymentErrorKey: AddPaymentErrorKey = 'different-fee-record-statuses';

      // Act
      const addPaymentError = getAddPaymentError(addPaymentErrorKey);

      // Assert
      expect(addPaymentError.text).toEqual('Select a fee or fees with the same status');
      expect(addPaymentError.href).toEqual('#premium-payments-table');
    });

    it("returns the error text and href when the payment error key is 'different-fee-record-payment-currencies'", () => {
      // Arrange
      const addPaymentErrorKey: AddPaymentErrorKey = 'different-fee-record-payment-currencies';

      // Act
      const addPaymentError = getAddPaymentError(addPaymentErrorKey);

      // Assert
      expect(addPaymentError.text).toEqual('Select fees with the same Reported payment currency');
      expect(addPaymentError.href).toEqual('#premium-payments-table');
    });

    it("returns the error text and href when the payment error key is 'multiple-does-not-match-selected'", () => {
      // Arrange
      const addPaymentErrorKey: AddPaymentErrorKey = 'multiple-does-not-match-selected';

      // Act
      const addPaymentError = getAddPaymentError(addPaymentErrorKey);

      // Assert
      expect(addPaymentError.text).toEqual("Select only one fee or fee group at 'Does not match' status");
      expect(addPaymentError.href).toEqual('#premium-payments-table');
    });
  });
});
