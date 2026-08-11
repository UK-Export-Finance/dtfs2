import { PRODUCT_TYPE_CODES } from '../../constants';
import { mapProductTypeCode } from '.';

describe('mapProductTypeCode', () => {
  describe('when isBssFacility is true', () => {
    it('should return the correct product type code', () => {
      // Arrange & Act
      const result = mapProductTypeCode({
        isBssFacility: true,
        isGefDeal: false,
      });

      // Assert
      const expected = PRODUCT_TYPE_CODES.BSS;

      expect(result).toEqual(expected);
    });
  });

  describe('when isGefDeal is true', () => {
    it('should return the correct product type code', () => {
      // Arrange & Act
      const result = mapProductTypeCode({
        isBssFacility: false,
        isGefDeal: true,
      });

      // Assert
      const expected = PRODUCT_TYPE_CODES.GEF;

      expect(result).toEqual(expected);
    });
  });
});
