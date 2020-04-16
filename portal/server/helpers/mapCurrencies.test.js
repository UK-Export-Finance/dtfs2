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
});
