const percentageToNumber = require('./percentageToNumber.helper');

describe('percentageToNumber()', () => {
  it('should convert percentage string to number without percentage symbol', () => {
    const coverPercentage = '80%';

    const result = percentageToNumber(coverPercentage);

    const expected = 80;

    expect(result).toEqual(expected);
  });

  it('should convert percentage with decimal string to number without percentage symbol', () => {
    const coverPercentage = '80.2%';

    const result = percentageToNumber(coverPercentage);

    const expected = 80.2;

    expect(result).toEqual(expected);
  });

  it('should return the same input when not a string', () => {
    const coverPercentage = 80;

    const result = percentageToNumber(coverPercentage);

    const expected = 80;

    expect(result).toEqual(expected);
  });

  it('should return null if null provided as coverPercentage', () => {
    const coverPercentage = null;

    const result = percentageToNumber(coverPercentage);

    const expected = null;

    expect(result).toEqual(expected);
  });
});
