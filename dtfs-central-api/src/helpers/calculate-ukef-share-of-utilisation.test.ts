import { calculateUkefShareOfUtilisation } from './calculate-ukef-share-of-utilisation';

describe('calculateUkefShareOfUtilisation', () => {
  it('should return the ukef share of the utilisation', () => {
    const utilisation = 100;
    const coverPercentage = 5;

    const result = calculateUkefShareOfUtilisation(utilisation, coverPercentage);

    expect(result).toEqual(5);
  });

  it('should return the ukef share of the utilisation when the result is a decimal', () => {
    const utilisation = 52;
    const coverPercentage = 35;

    const result = calculateUkefShareOfUtilisation(utilisation, coverPercentage);

    const expected = utilisation * (coverPercentage / 100);

    expect(result).toEqual(expected);
  });
});
