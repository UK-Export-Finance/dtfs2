const {
  calculateGuaranteeFee,
  calculateUkefExposure,
} = require('../../../src/v1/section-calculations');
const { roundNumber } = require('../../../src/utils/number');

describe('section-calculations', () => {
  describe('calculateGuaranteeFee', () => {
    it('should return a formatted riskMarginFee multiplied by .9', () => {
      const riskMarginFee = 100;
      const multiplication = riskMarginFee * 0.9;
      const expected = multiplication.toLocaleString('en', { minimumFractionDigits: 4 });
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
      const facilityValue = '12,34567891011';
      const coveredPercentage = '40';
      const result = calculateUkefExposure(facilityValue, coveredPercentage);

      const facilityValueWithoutCommas = facilityValue.replace(/,/g, '');
      const calculation = facilityValueWithoutCommas * (coveredPercentage / 100);

      const expected = calculation.toLocaleString('en', { minimumFractionDigits: 2 });
      expect(result).toEqual(expected);
    });

    describe('when the calculation result has more than 2 decimal points', () => {
      it('should round up', () => {
        const facilityValue = '1234567891011.2345';
        const coveredPercentage = '40';
        const result = calculateUkefExposure(facilityValue, coveredPercentage);

        const calculation = facilityValue * (coveredPercentage / 100);

        const roundedUp = roundNumber(calculation, 2);
        const expected = roundedUp.toLocaleString('en', { minimumFractionDigits: 2 });
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
