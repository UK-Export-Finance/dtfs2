import { calculateUkefExposure } from './calculate-ukef-exposure';

describe('calculateUkefExposure()', () => {
  it('should return the cover percentage without rounding when not needed', () => {
    const facilityValueInGBP = 5000;
    const coverPercentage = 80;

    const result = calculateUkefExposure(facilityValueInGBP, coverPercentage);
    const expected = 5000 * (80 / 100);
    expect(result).toEqual(expected);
  });

  it('should return a rounded number when more than 2 decimal places', () => {
    const facilityValueInGBP = 5165.2;
    const coverPercentage = 33;

    const result = calculateUkefExposure(facilityValueInGBP, coverPercentage);
    const expected = 1704.52;
    expect(result).toEqual(expected);
  });

  it('should return null if no facility value', () => {
    const facilityValueInGBP = undefined;
    const coverPercentage = 33;

    const result = calculateUkefExposure(facilityValueInGBP, coverPercentage);
    expect(result).toBeNull();
  });

  it('should return null if no cover percentage', () => {
    const facilityValueInGBP = 5165.2;
    const coverPercentage = undefined;

    const result = calculateUkefExposure(facilityValueInGBP, coverPercentage);
    expect(result).toBeNull();
  });

  it('should return null if no cover percentage and facility value', () => {
    const facilityValueInGBP = undefined;
    const coverPercentage = undefined;

    const result = calculateUkefExposure(facilityValueInGBP, coverPercentage);
    expect(result).toBeNull();
  });
});
