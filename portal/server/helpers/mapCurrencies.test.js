import mapCurrencies from './mapCurrencies';

describe('mapCurrencies', () => {
  it('should return an array of objects with value and text properties and first object with no value', () => {
    const mockCurrencies = [
      { id: 'CAD', text: 'CAD - Canadian Dollars' },
      { id: 'CHF', text: 'CHF - Swiss Francs' },
      { id: 'EGP', text: 'EGP - Egyptian Pounds' },
    ];

    const expected = [
      { text: 'Select value' },
      { value: 'CAD', text: 'CAD - Canadian Dollars' },
      { value: 'CHF', text: 'CHF - Swiss Francs' },
      { value: 'EGP', text: 'EGP - Egyptian Pounds' },
    ];

    expect(mapCurrencies(mockCurrencies)).toEqual(expected);
  });

  it('should mark a currency as `selected` when selectedCurrency param matches currency value', () => {
    const mockCurrencies = [
      { id: 'CAD', text: 'CAD - Canadian Dollars' },
      { id: 'CHF', text: 'CHF - Swiss Francs' },
      { id: 'EGP', text: 'EGP - Egyptian Pounds' },
    ];

    const expected = [
      { text: 'Select value' },
      { value: 'CAD', text: 'CAD - Canadian Dollars', selected: false },
      { value: 'CHF', text: 'CHF - Swiss Francs', selected: true },
      { value: 'EGP', text: 'EGP - Egyptian Pounds', selected: false },
    ];

    const selectedCurrency = { id: 'CHF', text: 'CHF - Swiss Francs' };
    const result = mapCurrencies(mockCurrencies, selectedCurrency);
    expect(result).toEqual(expected);
  });
});
