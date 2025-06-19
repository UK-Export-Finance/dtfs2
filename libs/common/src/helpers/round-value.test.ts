import { roundValue } from './round-value';

describe('roundValue', () => {
  it('should round value to 2 decimal places if more than 2 decimals are present', () => {
    const result = roundValue(1234.5678);

    expect(result).toEqual(1234.57);
  });

  it('should not change value if it has 2 or fewer decimal places', () => {
    const result1 = roundValue(1234.56);
    const result2 = roundValue(1234.5);
    const result3 = roundValue(1234);

    expect(result1).toEqual(1234.56);
    expect(result2).toEqual(1234.5);
    expect(result3).toEqual(1234);
  });

  it('should handle zero correctly', () => {
    const result = roundValue(0);

    expect(result).toEqual(0);
  });
});
