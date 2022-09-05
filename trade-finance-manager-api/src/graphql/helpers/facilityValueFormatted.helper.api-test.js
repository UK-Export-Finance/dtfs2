const facilityValueFormatted = require('./facilityValueFormatted.helper');

describe('facilityValueFormatted()', () => {
  it('should return BSS value as string unformatted', () => {
    const value = '30000.00';
    const result = facilityValueFormatted(value);

    expect(result).toEqual(value);
  });

  it('should return GEF value which already with 2 decimal places', () => {
    const value = 30000.00;
    const result = facilityValueFormatted(value.toFixed(2));

    expect(result).toEqual(value.toFixed(2));
  });

  it('should return GEF value with 2 decimal places when original did not have any decimal places', () => {
    const value = 30000;
    const result = facilityValueFormatted(value.toFixed(2));

    expect(result).toEqual(value.toFixed(2));
  });

  it('should return unformatted GEF value with 2 decimal places when original has 2 decimal places', () => {
    const value = 30000.53;
    const result = facilityValueFormatted(value);

    expect(result).toEqual(value);
  });
});
