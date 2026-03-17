import { findNullCurrencyBSSFacility } from './findNullCurrencyBSSFacility';

const currency = { id: 'GBP', text: 'Pound Sterling' };

describe('findNullCurrencyBSSFacility', () => {
  it('should return facilities with null currency where the currencySameAsSupplyContractCurrency is true', () => {
    const facilities = [
      { _id: '1', currencySameAsSupplyContractCurrency: 'true', currency: null },
      { _id: '2', currencySameAsSupplyContractCurrency: 'true', currency },
      { _id: '3', currencySameAsSupplyContractCurrency: 'false', currency: null },
      { _id: '4', currencySameAsSupplyContractCurrency: 'false', currency },
    ];

    const result = findNullCurrencyBSSFacility(facilities);

    expect(result).toEqual([facilities[0]]);
  });

  it('should return an empty array if no facilities have null currency where the currencySameAsSupplyContractCurrency is true', () => {
    const facilities = [
      { _id: '1', currencySameAsSupplyContractCurrency: 'true', currency },
      { _id: '2', currencySameAsSupplyContractCurrency: 'false', currency: null },
    ];

    const result = findNullCurrencyBSSFacility(facilities);

    expect(result).toEqual([]);
  });
});
