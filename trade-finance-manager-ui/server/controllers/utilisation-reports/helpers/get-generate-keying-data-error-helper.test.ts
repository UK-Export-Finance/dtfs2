import { GenerateKeyingDataErrorKey, getGenerateKeyingDataError } from './get-generate-keying-data-error-helper';

describe('get-generate-keying-data-error-helper', () => {
  describe('getGenerateKeyingDataError', () => {
    it("returns an array containing a single object containing the error text and href when the payment error key is 'no-matching-fee-records'", () => {
      // Arrange
      const addPaymentErrorKey: GenerateKeyingDataErrorKey = 'no-matching-fee-records';

      // Act
      const generateKeyingDataError = getGenerateKeyingDataError(addPaymentErrorKey);

      // Assert
      expect(generateKeyingDataError).toHaveLength(1);
      expect(generateKeyingDataError[0].text).toBe('No matched fees to generate keying data with');
      expect(generateKeyingDataError[0].href).toBe('#no-matching-fee-records');
    });
  });
});
