import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { DEAL_TYPE, PRODUCT_TYPE_CODES } from '../../../constants';
import { mapFacilityName } from '.';

describe('mapFacilityName', () => {
  const baseParams = {
    isCashFacility: false,
    isContingentFacility: false,
  };

  describe.each([{ flag: 'isCashFacility' }, { flag: 'isContingentFacility' }])('when $flag is true and facilityType is provided', ({ flag }) => {
    it('should return the facility name with product type code, facility type, and months of cover', () => {
      // Arrange
      const mockFacilityType = FACILITY_TYPE.CASH;
      const mockProductTypeCode = PRODUCT_TYPE_CODES.GEF;
      const mockMonthsOfCover = 12;

      const params = {
        facilityType: mockFacilityType,
        monthsOfCover: mockMonthsOfCover,
        productTypeCode: mockProductTypeCode,
        ...baseParams,
        [flag]: true,
      };

      // Act
      const result = mapFacilityName(params);

      // Assert
      const expected = `${DEAL_TYPE.GEF} ${mockFacilityType}: ${mockMonthsOfCover} months`;

      expect(result).toEqual(expected);
    });
  });

  describe.each([{ flag: 'isCashFacility' }, { flag: 'isContingentFacility' }])('when $flag is true and facilityType is not provided', ({ flag }) => {
    it('should return the facility name with only product type code and months of cover', () => {
      // Arrange
      const mockProductTypeCode = PRODUCT_TYPE_CODES.GEF;
      const mockMonthsOfCover = 18;

      const params = {
        monthsOfCover: mockMonthsOfCover,
        productTypeCode: mockProductTypeCode,
        ...baseParams,
        [flag]: true,
      };

      // Act
      const result = mapFacilityName(params);

      // Assert
      const expected = `${DEAL_TYPE.GEF}: ${mockMonthsOfCover} months`;

      expect(result).toEqual(expected);
    });
  });

  describe.each([{ flag: 'isCashFacility' }, { flag: 'isContingentFacility' }])('when $flag is true and facilityType is an empty string', ({ flag }) => {
    it('should return the facility name with only product type code and months of cover', () => {
      // Arrange
      const mockProductTypeCode = PRODUCT_TYPE_CODES.GEF;
      const mockMonthsOfCover = 6;

      const params = {
        facilityType: '',
        monthsOfCover: mockMonthsOfCover,
        productTypeCode: mockProductTypeCode,
        ...baseParams,
        [flag]: true,
      };

      // Act
      const result = mapFacilityName(params);

      // Assert
      const expected = `${DEAL_TYPE.GEF}: ${mockMonthsOfCover} months`;

      expect(result).toEqual(expected);
    });
  });

  describe(`when both isCashFacility and isContingentFacility are false - ${PRODUCT_TYPE_CODES.BSS}`, () => {
    it('should return the facility name with product type code and months of cover', () => {
      // Arrange
      const mockProductTypeCode = PRODUCT_TYPE_CODES.BSS;
      const mockMonthsOfCover = 24;

      const params = {
        monthsOfCover: mockMonthsOfCover,
        productTypeCode: mockProductTypeCode,
        ...baseParams,
      };

      // Act
      const result = mapFacilityName(params);

      // Assert
      const expected = `${DEAL_TYPE.BSS}: ${mockMonthsOfCover} months`;

      expect(result).toEqual(expected);
    });
  });

  describe(`when both isCashFacility and isContingentFacility are false - ${PRODUCT_TYPE_CODES.EWCS}`, () => {
    it('should return the facility name with product type code and months of cover', () => {
      // Arrange
      const mockProductTypeCode = PRODUCT_TYPE_CODES.EWCS;
      const mockMonthsOfCover = 24;

      const params = {
        monthsOfCover: mockMonthsOfCover,
        productTypeCode: mockProductTypeCode,
        ...baseParams,
      };

      // Act
      const result = mapFacilityName(params);

      // Assert
      const expected = `${DEAL_TYPE.EWCS}: ${mockMonthsOfCover} months`;

      expect(result).toEqual(expected);
    });
  });

  describe('when monthsOfCover is null', () => {
    it('should return null', () => {
      // Arrange
      const mockProductTypeCode = PRODUCT_TYPE_CODES.BSS;

      const params = {
        monthsOfCover: null,
        productTypeCode: mockProductTypeCode,
        ...baseParams,
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
        productTypeCode: mockProductTypeCode,
        ...baseParams,
      };

      // Act
      const result = mapFacilityName(params);

      // Assert
      expect(result).toBeNull();
    });
  });
});
