import { PREMIUM_PAYMENTS_TABLE_ERROR_HREF } from '../../../../constants/premium-payments-table-error-href';
import { GENERATE_KEYING_DATA_ERROR_KEY } from '../../../../constants/premium-payment-tab-error-keys';
import { getGenerateKeyingDataError, validateGenerateKeyingDataErrorKey } from './generate-keying-data-error';
import { GenerateKeyingDataErrorKey } from '../../../../types/premium-payments-tab-error-keys';

describe('generate-keying-data-error', () => {
  describe('getGenerateKeyingDataError', () => {
    it(`returns the error text and href when the payment error key is '${GENERATE_KEYING_DATA_ERROR_KEY.NO_MATCHING_FEE_RECORDS}'`, () => {
      // Arrange
      const errorKey = GENERATE_KEYING_DATA_ERROR_KEY.NO_MATCHING_FEE_RECORDS;

      // Act
      const error = getGenerateKeyingDataError(errorKey);

      // Assert
      expect(error.text).toEqual('No matched fees to generate keying data with');
      expect(error.href).toEqual(PREMIUM_PAYMENTS_TABLE_ERROR_HREF);
    });
  });

  describe('validateGenerateKeyingDataErrorKey', () => {
    it('should throw when provided string is not a valid generate keying data error key', () => {
      // Arrange
      const invalidKey = 'not-a-valid-key';

      // Act + Assert
      expect(() => validateGenerateKeyingDataErrorKey(invalidKey)).toThrow(new Error(`Unrecognised generate keying data error key '${invalidKey}'`));
    });

    it.each(Object.values(GENERATE_KEYING_DATA_ERROR_KEY))(
      'should return true when given string is a valid generate keying data error key',
      (generateKeyingDataErrorKey: GenerateKeyingDataErrorKey) => {
        // Act
        const result = validateGenerateKeyingDataErrorKey(generateKeyingDataErrorKey);

        // Assert
        expect(result).toEqual(true);
      },
    );
  });
});
