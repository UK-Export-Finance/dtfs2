import { CURRENCY } from '../constants';
import { CurrencyAndAmount } from '../types';
import { getFormattedCurrencyAndAmount, isCurrencyValid } from './currency';

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
      expect(formattedCurrencyAndAmount).toEqual(expectedFormattedCurrencyAndAmount);
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
      expect(formattedCurrencyAndAmount).toEqual(expectedFormattedCurrencyAndAmount);
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
      expect(formattedCurrencyAndAmount).toEqual(expectedFormattedCurrencyAndAmount);
    });
  });

  describe('isCurrencyValid', () => {
    it('should return true when currency is a valid CURRENCY enum value', () => {
      // Arrange
      const validCurrency = CURRENCY.GBP;

      // Act
      const result = isCurrencyValid(validCurrency);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when currency is not a valid CURRENCY enum value', () => {
      // Arrange
      const invalidCurrency = 'INVALID';

      // Act
      const result = isCurrencyValid(invalidCurrency);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when currency is undefined', () => {
      // Arrange
      const undefinedCurrency = undefined;

      // Act
      const result = isCurrencyValid(undefinedCurrency);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when currency is an empty string', () => {
      // Arrange
      const emptyCurrency = '';

      // Act
      const result = isCurrencyValid(emptyCurrency);

      // Assert
      expect(result).toBe(false);
    });
  });
});
