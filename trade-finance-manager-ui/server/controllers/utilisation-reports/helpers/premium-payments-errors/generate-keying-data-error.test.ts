import { GENERATE_KEYING_DATA_ERROR_KEY } from '../../../../constants/premium-payment-tab-error-keys';
import { getGenerateKeyingDataError } from './generate-keying-data-error';

describe('generate-keying-data-error', () => {
  describe('getGenerateKeyingDataError', () => {
    it(`returns the error text and href when the payment error key is '${GENERATE_KEYING_DATA_ERROR_KEY.NO_MATCHING_FEE_RECORDS}'`, () => {
      // Arrange
      const errorKey = GENERATE_KEYING_DATA_ERROR_KEY.NO_MATCHING_FEE_RECORDS;

      // Act
      const error = getGenerateKeyingDataError(errorKey);

      // Assert
      expect(error.text).toEqual('No matched fees to generate keying data with');
      expect(error.href).toEqual('#premium-payments-table-error');
    });
  });
});
