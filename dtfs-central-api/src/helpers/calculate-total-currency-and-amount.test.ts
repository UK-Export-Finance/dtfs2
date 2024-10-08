import { CurrencyAndAmount } from '@ukef/dtfs2-common';
import { calculateTotalCurrencyAndAmount } from './calculate-total-currency-and-amount';

describe('calculateTotalCurrencyAndAmount', () => {
  it('throws an error if the supplied list is empty', () => {
    // Act / Assert
    expect(() => calculateTotalCurrencyAndAmount([])).toThrow(Error);
  });

  it('throws an error if the currency values in the list is inconsistent', () => {
    // Arrange
    const currencyAndAmountList: CurrencyAndAmount[] = [
      { currency: 'GBP', amount: 100 },
      { currency: 'GBP', amount: 50 },
      { currency: 'EUR', amount: 200 },
    ];

    // Act / Assert
    expect(() => calculateTotalCurrencyAndAmount(currencyAndAmountList)).toThrow(Error);
  });

  it('returns an object with the same currency as the supplied list', () => {
    // Arrange
    const currencyAndAmountList: CurrencyAndAmount[] = [
      { currency: 'JPY', amount: 100 },
      { currency: 'JPY', amount: 50 },
      { currency: 'JPY', amount: 200 },
    ];

    // Act
    const totalCurrencyAndAmount = calculateTotalCurrencyAndAmount(currencyAndAmountList);

    // Assert
    expect(totalCurrencyAndAmount.currency).toBe('JPY');
  });

  it('returns an object with the sum total of the supplied list amount as the amount', () => {
    // Arrange
    const currencyAndAmountList: CurrencyAndAmount[] = [
      { currency: 'JPY', amount: 100 },
      { currency: 'JPY', amount: 50 },
      { currency: 'JPY', amount: 200 },
    ];

    // Act
    const totalCurrencyAndAmount = calculateTotalCurrencyAndAmount(currencyAndAmountList);

    // Assert
    expect(totalCurrencyAndAmount.amount).toBe(350);
  });
});
