import { Currency, CURRENCY } from '@ukef/dtfs2-common';
import { getCurrencySymbol } from './getCurrencySymbol';

describe('getCurrencySymbol', () => {
  const testCases = [
    {
      id: CURRENCY.GBP,
      expected: '£',
    },
    {
      id: CURRENCY.EUR,
      expected: '€',
    },
    {
      id: CURRENCY.USD,
      expected: '$',
    },
    {
      id: CURRENCY.JPY,
      expected: '¥',
    },
    {
      id: 'an invalid currency' as Currency,
      expected: '',
    },
  ];

  it.each(testCases)('should return `$expected` when the currency is `$id`', ({ id, expected }) => {
    // Act
    const result = getCurrencySymbol(id);

    // Assert
    expect(result).toEqual(expected);
  });
});
