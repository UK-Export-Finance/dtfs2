import { BSS_EWCS_FACILITY_TYPE, GEF_FACILITY_TYPE } from '@ukef/dtfs2-common';
import { mapProductTypeCode } from '.';
import { PRODUCT_TYPE_CODES } from '../../constants';

describe('mapProductTypeCode', () => {
  describe(`when isBssEwcsDeal is true and facilityCategoryCode is ${BSS_EWCS_FACILITY_TYPE.BOND}`, () => {
    it('should return the correct product type code', () => {
      // Arrange & Act
      const result = mapProductTypeCode({
        isBssEwcsDeal: true,
        isGefDeal: false,
        facilityCategoryCode: BSS_EWCS_FACILITY_TYPE.BOND,
      });

      // Assert
      const expected = PRODUCT_TYPE_CODES.BSS;

      expect(result).toEqual(expected);
    });
  });

  describe(`when isBssEwcsDeal is true and facilityCategoryCode is NOT ${BSS_EWCS_FACILITY_TYPE.BOND}`, () => {
    it('should return the correct product type code', () => {
      // Arrange & Act
      const result = mapProductTypeCode({
        isBssEwcsDeal: true,
        isGefDeal: false,
        facilityCategoryCode: BSS_EWCS_FACILITY_TYPE.LOAN,
      });

      // Assert
      const expected = PRODUCT_TYPE_CODES.UNKNOWN;

      expect(result).toEqual(expected);
    });
  });

  describe('when isGefDeal is true', () => {
    it('should return the correct product type code', () => {
      // Arrange & Act
      const result = mapProductTypeCode({
        isBssEwcsDeal: false,
        isGefDeal: true,
        facilityCategoryCode: GEF_FACILITY_TYPE.CASH,
      });

      // Assert
      const expected = PRODUCT_TYPE_CODES.GEF;

      expect(result).toEqual(expected);
    });
  });
});
