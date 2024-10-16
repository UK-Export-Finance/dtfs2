import { calculateUkefShareOfUtilisation } from './calculate-ukef-share-of-utilisation';

describe('calculateUkefShareOfUtilisation', () => {
  it('should return the ukef share of the utilisation', () => {
    const utilisation = 100;
    const coverPercentage = 5;

    const result = calculateUkefShareOfUtilisation(utilisation, coverPercentage);

    expect(result).toEqual(5);
  });
});
