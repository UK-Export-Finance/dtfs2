import { CurrencyAndAmount } from '../types';
import { getFormattedCurrencyAndAmount } from './currency';

describe('currency helpers', () => {
  describe('getFormattedCurrencyAndAmount', () => {
    it('gets the formatted the current and amount string with thousands separated by comma and only 2 decimal places', () => {
      // Arrange
      const currencyAndAmount: CurrencyAndAmount = {
        currency: 'GBP',
        amount: 1234567.8912,
      };

      const expectedFormattedCurrencyAndAmount = 'GBP 1,234,567.89';

      // Act
      const formattedCurrencyAndAmount = getFormattedCurrencyAndAmount(currencyAndAmount);

      // Assert
      expect(formattedCurrencyAndAmount).toBe(expectedFormattedCurrencyAndAmount);
    });
  });
});
