import { calculateUkefShareOfUtilisation } from './calculate-ukef-share-of-utilisation';

describe('calculateUkefShareOfUtilisation', () => {
  it('should return the ukef share of the utilisation', () => {
    const utilisation = 52;
    const coverPercentage = 35;

    const result = calculateUkefShareOfUtilisation(utilisation, coverPercentage);

    const expected = utilisation * (coverPercentage / 100);

    expect(result).toEqual(expected);
  });

  it('should round the ukef share of the utilisation to 2 decimal places', () => {
    const utilisation = 26.85;
    const coverPercentage = 45;

    const result = calculateUkefShareOfUtilisation(utilisation, coverPercentage);

    // utilisation * (coverPercentage / 100);

    expect(result).toEqual(12.08);
  });
});
