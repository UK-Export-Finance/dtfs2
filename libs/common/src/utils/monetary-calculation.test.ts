import { divideAmountByExchangeRate } from './monetary-calculation';

describe('monetary-calculation utils', () => {
  describe('divideAmountByExchangeRate', () => {
    it('returns the value divided by the exchange rate with the specified number of decimal places', () => {
      // Arrange
      const amount = 1.000001;
      const exchangeRate = 1.6;

      const expectedConvertedAmount = 0.625000625;

      // Act
      const covertedAmount = divideAmountByExchangeRate(amount, exchangeRate, 10);

      // Assert
      expect(covertedAmount).toBe(expectedConvertedAmount);

      // Without big.js
      expect(amount / exchangeRate).not.toBe(expectedConvertedAmount);
    });

    it('returns the value divided by the exchange rate using the default precision of 2', () => {
      // Arrange
      const amount = 1.000001;
      const exchangeRate = 1.6;

      const expectedConvertedAmount = 0.63;

      // Act
      const covertedAmount = divideAmountByExchangeRate(amount, exchangeRate);

      // Assert
      expect(covertedAmount).toBe(expectedConvertedAmount);

      // Without big.js
      expect(amount / exchangeRate).not.toBe(expectedConvertedAmount);
    });
  });
});
