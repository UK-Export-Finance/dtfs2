import { applyExchangeRateToAmount } from './monetary-calculation';

describe('monetary-calculation utils', () => {
  describe('applyExchangeRateToAmount', () => {
    it('returns the value multiplied by the exchange rate applied with the specified number of decimal places', () => {
      // Arrange
      const amount = 100.01;
      const exchangeRate = 1.05;

      const expectedConvertedAmount = 105.0105;

      // Act
      const covertedAmount = applyExchangeRateToAmount(amount, exchangeRate, 'multiply', 4);

      // Assert
      expect(covertedAmount).toBe(expectedConvertedAmount);

      // Without big.js
      expect(amount * exchangeRate).not.toBe(expectedConvertedAmount);
    });

    it('returns the value multiplied by the supplied exchange rate applied using the default precision of 2', () => {
      // Arrange
      const amount = 100.01;
      const exchangeRate = 1.05;

      const expectedConvertedAmount = 105.01;

      // Act
      const covertedAmount = applyExchangeRateToAmount(amount, exchangeRate, 'multiply');

      // Assert
      expect(covertedAmount).toBe(expectedConvertedAmount);

      // Without big.js
      expect(amount * exchangeRate).not.toBe(expectedConvertedAmount);
    });

    it('returns the value divided by the supplied exchange rate applied using the default precision of 2', () => {
      // Arrange
      const amount = 100;
      const exchangeRate = 3;

      const expectedConvertedAmount = 33.33;

      // Act
      const convertedAmount = applyExchangeRateToAmount(amount, exchangeRate, 'divide');

      // Assert
      expect(convertedAmount).toBe(expectedConvertedAmount);
    });

    it('throws an error when an invalid operation is supplied', () => {
      // Arrange
      const amount = 100;
      const exchangeRate = 1;

      const operation = 'add';

      // Act / Assert
      // @ts-expect-error we are checking for an invalid operation
      expect(() => applyExchangeRateToAmount(amount, exchangeRate, operation)).toThrow(
        new Error(`Operation '${operation}' not recognised (expected 'multiply' or 'divide')`),
      );
    });
  });
});
