import { CurrencyAndAmount } from '../types';
import { getFormattedCurrencyAndAmount } from './currency';

describe('currency helpers', () => {
  describe('getFormattedCurrencyAndAmount', () => {
    it('gets the formatted the current and amount string with thousands separated by comma', () => {
      // Arrange
      const currencyAndAmount: CurrencyAndAmount = {
        currency: 'GBP',
        amount: 1234567.89,
      };

      const expectedFormattedCurrencyAndAmount = 'GBP 1,234,567.89';

      // Act
      const formattedCurrencyAndAmount = getFormattedCurrencyAndAmount(currencyAndAmount);

      // Assert
      expect(formattedCurrencyAndAmount).toBe(expectedFormattedCurrencyAndAmount);
    });

    it('gets the formatted the current and amount string with 2 decimal places when the amount has more than 2 decimal places', () => {
      // Arrange
      const currencyAndAmount: CurrencyAndAmount = {
        currency: 'GBP',
        amount: 1234567.89123,
      };

      const expectedFormattedCurrencyAndAmount = 'GBP 1,234,567.89';

      // Act
      const formattedCurrencyAndAmount = getFormattedCurrencyAndAmount(currencyAndAmount);

      // Assert
      expect(formattedCurrencyAndAmount).toBe(expectedFormattedCurrencyAndAmount);
    });

    it('gets the formatted the current and amount string with 2 decimal places when the amount has no decimal places', () => {
      // Arrange
      const currencyAndAmount: CurrencyAndAmount = {
        currency: 'GBP',
        amount: 1234567,
      };

      const expectedFormattedCurrencyAndAmount = 'GBP 1,234,567.00';

      // Act
      const formattedCurrencyAndAmount = getFormattedCurrencyAndAmount(currencyAndAmount);

      // Assert
      expect(formattedCurrencyAndAmount).toBe(expectedFormattedCurrencyAndAmount);
    });
  });
});
