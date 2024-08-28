import { GenerateKeyingDataErrorKey, getGenerateKeyingDataError } from './get-generate-keying-data-error-helper';

describe('get-generate-keying-data-error-helper', () => {
  describe('getGenerateKeyingDataError', () => {
    it("returns the error text and href when the payment error key is 'no-matching-fee-records'", () => {
      // Arrange
      const addPaymentErrorKey: GenerateKeyingDataErrorKey = 'no-matching-fee-records';

      // Act
      const generateKeyingDataError = getGenerateKeyingDataError(addPaymentErrorKey);

      // Assert
      expect(generateKeyingDataError.text).toBe('No matched fees to generate keying data with');
      expect(generateKeyingDataError.href).toBe('#premium-payments-table');
    });
  });
});
