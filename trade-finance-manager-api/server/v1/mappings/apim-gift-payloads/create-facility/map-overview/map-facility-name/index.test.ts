import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { DEAL_TYPE, PRODUCT_TYPE_CODES } from '../../../constants';
import { mapFacilityName } from '.';

describe('mapFacilityName', () => {
  describe('when isGefDeal is true and facilityType is provided', () => {
    it('should return the facility name with product type code, facility type, and months of cover', () => {
      // Arrange
      const mockFacilityType = FACILITY_TYPE.CASH;
      const mockProductTypeCode = PRODUCT_TYPE_CODES.GEF;
      const mockMonthsOfCover = 12;

      const params = {
        facilityType: mockFacilityType,
        isGefDeal: true,
        monthsOfCover: mockMonthsOfCover,
        productTypeCode: mockProductTypeCode,
      };

      // Act
      const result = mapFacilityName(params);

      // Assert
      const expected = `${DEAL_TYPE.GEF} ${mockFacilityType}: ${mockMonthsOfCover} months`;

      expect(result).toEqual(expected);
    });
  });

  describe('when isGefDeal is true and facilityType is not provided', () => {
    it('should return the facility name with only product type code and months of cover', () => {
      // Arrange
      const mockProductTypeCode = PRODUCT_TYPE_CODES.GEF;
      const mockMonthsOfCover = 18;

      const params = {
        isGefDeal: true,
        monthsOfCover: mockMonthsOfCover,
        productTypeCode: mockProductTypeCode,
      };

      // Act
      const result = mapFacilityName(params);

      // Assert
      const expected = `${DEAL_TYPE.GEF}: ${mockMonthsOfCover} months`;

      expect(result).toEqual(expected);
    });
  });

  describe('when isGefDeal is true and facilityType is an empty string', () => {
    it('should return the facility name with only product type code and months of cover', () => {
      // Arrange
      const mockProductTypeCode = PRODUCT_TYPE_CODES.GEF;
      const mockMonthsOfCover = 6;

      const params = {
        facilityType: '',
        isGefDeal: true,
        monthsOfCover: mockMonthsOfCover,
        productTypeCode: mockProductTypeCode,
      };

      // Act
      const result = mapFacilityName(params);

      // Assert
      const expected = `${DEAL_TYPE.GEF}: ${mockMonthsOfCover} months`;

      expect(result).toEqual(expected);
    });
  });

  describe('when isGefDeal is false', () => {
    it('should return the facility name with product type code and months of cover', () => {
      // Arrange
      const mockProductTypeCode = PRODUCT_TYPE_CODES.BSS;
      const mockMonthsOfCover = 24;

      const params = {
        isGefDeal: false,
        monthsOfCover: mockMonthsOfCover,
        productTypeCode: mockProductTypeCode,
      };

      // Act
      const result = mapFacilityName(params);

      // Assert
      const expected = `${DEAL_TYPE.BSS}: ${mockMonthsOfCover} months`;

      expect(result).toEqual(expected);
    });
  });

  describe('when monthsOfCover is null', () => {
    it('should return null', () => {
      // Arrange
      const mockProductTypeCode = PRODUCT_TYPE_CODES.BSS;

      const params = {
        isGefDeal: false,
        monthsOfCover: null,
        productTypeCode: mockProductTypeCode,
      };

      // Act
      const result = mapFacilityName(params);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('when monthsOfCover is undefined', () => {
    it('should return null', () => {
      // Arrange
      const mockProductTypeCode = PRODUCT_TYPE_CODES.GEF;

      const params = {
        isGefDeal: true,
        productTypeCode: mockProductTypeCode,
      };

      // Act
      const result = mapFacilityName(params);

      // Assert
      expect(result).toBeNull();
    });
  });
});
