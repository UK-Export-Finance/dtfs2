const calculateUkefExposure = require('./calculateUkefExposure');
const { roundNumber } = require('./number');

describe('calculateUkefExposure', () => {
  const basicCalculation = (value, percentage) => value * (percentage / 100);

  describe('when calculation equates to more than 2 decimals', () => {
    it('should return rounded number with timestamp', () => {
      const valueInGBP = 12.123;
      const coveredPercentage = 24;

      const result = calculateUkefExposure(valueInGBP, coveredPercentage);

      const expected = roundNumber(basicCalculation(valueInGBP, coveredPercentage), 2);

      expect(result).toEqual({
        ukefExposure: expected,
        ukefExposureCalculationTimestamp: expect.any(String),
      });
    });
  });

  describe('when calculation does NOT equate to more than 2 decimals', () => {
    it('should return the calculation with timestamp', () => {
      const valueInGBP = 1000;
      const coveredPercentage = 10;

      const result = calculateUkefExposure(valueInGBP, coveredPercentage);

      const expected = basicCalculation(valueInGBP, coveredPercentage);

      expect(result).toEqual({
        ukefExposure: expected,
        ukefExposureCalculationTimestamp: expect.any(String),
      });
    });
  });
});
