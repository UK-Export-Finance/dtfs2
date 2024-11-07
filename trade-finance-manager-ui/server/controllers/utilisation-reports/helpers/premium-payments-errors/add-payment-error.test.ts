import { ADD_PAYMENT_ERROR_KEY } from '../../../../constants/premium-payment-tab-error-keys';
import { getAddPaymentError } from './add-payment-error';

describe('add-payment-error', () => {
  describe('getAddPaymentError', () => {
    it(`returns the error text and href when the payment error key is '${ADD_PAYMENT_ERROR_KEY.NO_FEE_RECORDS_SELECTED}'`, () => {
      // Arrange
      const errorKey = ADD_PAYMENT_ERROR_KEY.NO_FEE_RECORDS_SELECTED;

      // Act
      const error = getAddPaymentError(errorKey);

      // Assert
      expect(error.text).toEqual('Select a fee or fees to add a payment to');
      expect(error.href).toEqual('#premium-payments-table-error');
    });

    it(`returns the error text and href when the payment error key is '${ADD_PAYMENT_ERROR_KEY.DIFFERENT_STATUSES}'`, () => {
      // Arrange
      const errorKey = ADD_PAYMENT_ERROR_KEY.DIFFERENT_STATUSES;

      // Act
      const error = getAddPaymentError(errorKey);

      // Assert
      expect(error.text).toEqual('Select a fee or fees with the same status');
      expect(error.href).toEqual('#premium-payments-table-error');
    });

    it(`returns the error text and href when the payment error key is '${ADD_PAYMENT_ERROR_KEY.DIFFERENT_PAYMENT_CURRENCIES}'`, () => {
      // Arrange
      const errorKey = ADD_PAYMENT_ERROR_KEY.DIFFERENT_PAYMENT_CURRENCIES;

      // Act
      const error = getAddPaymentError(errorKey);

      // Assert
      expect(error.text).toEqual('Select fees with the same Reported payment currency');
      expect(error.href).toEqual('#premium-payments-table-error');
    });

    it(`returns the error text and href when the payment error key is '${ADD_PAYMENT_ERROR_KEY.NO_FEE_RECORDS_SELECTED}'`, () => {
      // Arrange
      const errorKey = ADD_PAYMENT_ERROR_KEY.MULTIPLE_DOES_NOT_MATCH_SELECTED;

      // Act
      const error = getAddPaymentError(errorKey);

      // Assert
      expect(error.text).toEqual("Select only one fee or fee group at 'Does not match' status");
      expect(error.href).toEqual('#premium-payments-table-error');
    });
  });
});
