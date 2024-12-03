import { PREMIUM_PAYMENTS_TABLE_ERROR_HREF } from '../../../../constants/premium-payments-table-error-href';
import { ADD_PAYMENT_ERROR_KEY } from '../../../../constants/premium-payment-tab-error-keys';
import { getAddPaymentError, validateAddPaymentErrorKey } from './add-payment-error';
import { AddPaymentErrorKey } from '../../../../types/premium-payments-tab-error-keys';

describe('add-payment-error', () => {
  describe('getAddPaymentError', () => {
    it(`returns the error text and href when the payment error key is '${ADD_PAYMENT_ERROR_KEY.NO_FEE_RECORDS_SELECTED}'`, () => {
      // Arrange
      const errorKey = ADD_PAYMENT_ERROR_KEY.NO_FEE_RECORDS_SELECTED;

      // Act
      const error = getAddPaymentError(errorKey);

      // Assert
      expect(error.text).toEqual('Select a fee or fees to add a payment to');
      expect(error.href).toEqual(PREMIUM_PAYMENTS_TABLE_ERROR_HREF);
    });

    it(`returns the error text and href when the payment error key is '${ADD_PAYMENT_ERROR_KEY.DIFFERENT_STATUSES}'`, () => {
      // Arrange
      const errorKey = ADD_PAYMENT_ERROR_KEY.DIFFERENT_STATUSES;

      // Act
      const error = getAddPaymentError(errorKey);

      // Assert
      expect(error.text).toEqual('Select a fee or fees with the same status');
      expect(error.href).toEqual(PREMIUM_PAYMENTS_TABLE_ERROR_HREF);
    });

    it(`returns the error text and href when the payment error key is '${ADD_PAYMENT_ERROR_KEY.DIFFERENT_PAYMENT_CURRENCIES}'`, () => {
      // Arrange
      const errorKey = ADD_PAYMENT_ERROR_KEY.DIFFERENT_PAYMENT_CURRENCIES;

      // Act
      const error = getAddPaymentError(errorKey);

      // Assert
      expect(error.text).toEqual('Select fees with the same Reported payment currency');
      expect(error.href).toEqual(PREMIUM_PAYMENTS_TABLE_ERROR_HREF);
    });

    it(`returns the error text and href when the payment error key is '${ADD_PAYMENT_ERROR_KEY.NO_FEE_RECORDS_SELECTED}'`, () => {
      // Arrange
      const errorKey = ADD_PAYMENT_ERROR_KEY.MULTIPLE_DOES_NOT_MATCH_SELECTED;

      // Act
      const error = getAddPaymentError(errorKey);

      // Assert
      expect(error.text).toEqual("Select only one fee or fee group at 'Does not match' status");
      expect(error.href).toEqual(PREMIUM_PAYMENTS_TABLE_ERROR_HREF);
    });
  });

  describe('validateAddPaymentErrorKey', () => {
    it('should throw when provided string is not a valid add payment error key', () => {
      // Arrange
      const invalidKey = 'not-a-valid-key';

      // Act + Assert
      expect(() => validateAddPaymentErrorKey(invalidKey)).toThrow(new Error(`Unrecognised add payment error key '${invalidKey}'`));
    });

    it.each(Object.values(ADD_PAYMENT_ERROR_KEY))(
      'should return true when given string is a valid add payment error key',
      (addPaymentErrorKey: AddPaymentErrorKey) => {
        // Act
        const result = validateAddPaymentErrorKey(addPaymentErrorKey);

        // Assert
        expect(result).toEqual(true);
      },
    );
  });
});
