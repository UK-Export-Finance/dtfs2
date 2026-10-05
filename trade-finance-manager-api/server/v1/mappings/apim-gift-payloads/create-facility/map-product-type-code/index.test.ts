import { PRODUCT_TYPE_CODES } from '../../constants';
import { mapProductTypeCode } from '.';

describe('mapProductTypeCode', () => {
  const baseParams = {
    isBssFacility: false,
    isCashFacility: false,
    isContingentFacility: false,
    isEwcsFacility: false,
  };

  describe('when isBssFacility is true', () => {
    it('should return the correct product type code', () => {
      // Arrange & Act
      const result = mapProductTypeCode({
        ...baseParams,
        isBssFacility: true,
      });

      // Assert
      expect(result).toEqual(PRODUCT_TYPE_CODES.BSS);
    });
  });

  describe.each([{ flag: 'isCashFacility' }, { flag: 'isContingentFacility' }])('when $flag is true', ({ flag }) => {
    it('should return the correct product type code', () => {
      // Arrange & Act
      const result = mapProductTypeCode({
        ...baseParams,
        [flag]: true,
      });

      // Assert
      expect(result).toEqual(PRODUCT_TYPE_CODES.GEF);
    });
  });

  describe('when isEwcsFacility is true', () => {
    it('should return the correct product type code', () => {
      // Arrange & Act
      const result = mapProductTypeCode({
        ...baseParams,
        isEwcsFacility: true,
      });

      // Assert
      expect(result).toEqual(PRODUCT_TYPE_CODES.EWCS);
    });
  });

  describe('when all flags are false', () => {
    it(`should return ${PRODUCT_TYPE_CODES.UNKNOWN}`, () => {
      // Arrange & Act
      const result = mapProductTypeCode(baseParams);

      // Assert
      const expected = PRODUCT_TYPE_CODES.UNKNOWN;

      expect(result).toEqual(expected);
    });
  });
});
