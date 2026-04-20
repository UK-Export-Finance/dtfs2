import { DAY_BASIS_CODE } from '../../../constants';
import { mapDayBasisCode } from '.';

describe('mapDayBasisCode', () => {
  describe('when dayCountBasis is 360', () => {
    it(`should return ${DAY_BASIS_CODE.ACTUAL_360}`, () => {
      // Act
      const result = mapDayBasisCode('360');

      // Assert
      const expected = DAY_BASIS_CODE.ACTUAL_360;

      expect(result).toEqual(expected);
    });
  });

  describe('when dayCountBasis is 365', () => {
    it(`should return ${DAY_BASIS_CODE.ACTUAL_365}`, () => {
      // Act
      const result = mapDayBasisCode('365');

      // Assert
      const expected = DAY_BASIS_CODE.ACTUAL_365;

      expect(result).toEqual(expected);
    });
  });

  describe('when dayCountBasis is not recognised', () => {
    it('should return null', () => {
      // Act
      const result = mapDayBasisCode('123');

      // Assert
      expect(result).toBeNull();
    });
  });
});
