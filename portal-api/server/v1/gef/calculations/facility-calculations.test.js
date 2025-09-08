const { calculateUkefExposure, calculateGuaranteeFee } = require('./facility-calculations');
const { roundNumber } = require('../../../utils/number');

describe('calculateUkefExposure', () => {
  describe('when value and coverPercentage is present in the requested update', () => {
    it('should calculate based on the provided values', () => {
      const update = {
        value: '1234',
        coverPercentage: '25',
      };
      const existingFacility = {};

      const result = calculateUkefExposure(update, existingFacility);

      const expected = Number(update.value) * (Number(update.coverPercentage) / 100);
      expect(result).toEqual(expected);
    });

    describe('when the calculated value generated from requested update contains more than 2 decimals', () => {
      describe('when value and coverPercentage is present in the requested update', () => {
        it('should calculate and round the number based on the provided values', () => {
          const update = {
            value: '1234567',
            coverPercentage: '70',
          };
          const existingFacility = {};

          const result = calculateUkefExposure(update, existingFacility);

          const calculation = Number(update.value) * (Number(update.coverPercentage) / 100);

          const expected = roundNumber(calculation);
          expect(result).toEqual(expected);
        });
      });
    });
  });

  describe('when value and coverPercentage is NOT present in the requested update', () => {
    it('should calculate with existing values', () => {
      const update = {};
      const existingFacility = {
        value: 1234,
        coverPercentage: 25,
      };

      const result = calculateUkefExposure(update, existingFacility);

      const expected = existingFacility.value * (existingFacility.coverPercentage / 100);
      expect(result).toEqual(expected);
    });
  });
});

describe('calculateGuaranteeFee', () => {
  describe('when interestPercentage is present in the requested update', () => {
    it('should calculate using the the provided interestPercentage, limited to 3 decimal points', () => {
      const update = {
        interestPercentage: '25',
      };
      const existingFacility = {};

      const result = calculateGuaranteeFee(update, existingFacility);

      const calculation = 0.9 * Number(update.interestPercentage);
      const expected = Number(calculation.toFixed(3));

      expect(result).toEqual(expected);
    });
  });

  describe('when interestPercentage is NOT present in the requested update', () => {
    it('should calculate with existing interestPercentage', () => {
      const update = {};
      const existingFacility = {
        interestPercentage: 25,
      };

      const result = calculateGuaranteeFee(update, existingFacility);

      const calculation = 0.9 * Number(existingFacility.interestPercentage);
      const expected = Number(calculation.toFixed(3));

      expect(result).toEqual(expected);
    });
  });
});
