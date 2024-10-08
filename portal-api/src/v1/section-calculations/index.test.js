const { calculateGuaranteeFee, calculateUkefExposure } = require('.');
const { roundNumber, formattedNumber } = require('../../utils/number');

describe('section-calculations', () => {
  describe('calculateGuaranteeFee', () => {
    it('should return a formatted riskMarginFee multiplied by .9', () => {
      const riskMarginFee = 100;
      const multiplication = riskMarginFee * 0.9;
      const expected = formattedNumber(multiplication, 4);
      expect(calculateGuaranteeFee(riskMarginFee)).toEqual(expected);
    });

    describe('when riskMarginFee param is empty', () => {
      it('should return riskMarginFee', () => {
        expect(calculateGuaranteeFee('')).toEqual('');
      });
    });
  });

  describe('calculateUkefExposure', () => {
    it('should return correct, formatted calculation', () => {
      const value = '12,34567891011';
      const coveredPercentage = '40';
      const result = calculateUkefExposure(value, coveredPercentage);

      const facilityValueWithoutCommas = value.replace(/,/g, '');
      const calculation = facilityValueWithoutCommas * (coveredPercentage / 100);

      const expected = formattedNumber(calculation, 2);
      expect(result).toEqual(expected);
    });

    describe('when the calculation result has more than 2 decimal points', () => {
      it('should round up', () => {
        const value = '1234567891011.2345';
        const coveredPercentage = '40';
        const result = calculateUkefExposure(value, coveredPercentage);

        const calculation = value * (coveredPercentage / 100);

        const roundedUp = roundNumber(calculation, 2);
        const expected = formattedNumber(roundedUp, 2);
        expect(result).toEqual(expected);
      });
    });

    describe('when one of the params is missing/empty', () => {
      it('should return empty string', () => {
        expect(calculateUkefExposure('1', '')).toEqual('');
        expect(calculateUkefExposure('', '2')).toEqual('');
      });
    });
  });
});
