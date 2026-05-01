import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { APIM_GIFT_INTEGRATION, PRODUCT_TYPE_CODES, PRODUCT_TYPE_CODES_TO_DEAL_TYPE } from '../../../constants';
import { mapFacilityName } from '.';

const { CONSUMER } = APIM_GIFT_INTEGRATION;

describe('mapFacilityName', () => {
  const mockBankInternalRefName = 'Nighthawk facility 1';

  describe('when isGefDeal is true', () => {
    it('should return the facility name with the facility category code and product type code', () => {
      // Arrange
      const mockFacilityType = FACILITY_TYPE.CASH;
      const mockProductTypeCode = PRODUCT_TYPE_CODES.GEF;

      const params = {
        bankInternalRefName: mockBankInternalRefName,
        facilityType: mockFacilityType,
        isGefDeal: true,
        productTypeCode: mockProductTypeCode,
      };

      // Act
      const result = mapFacilityName(params);

      // Assert
      const expectedProductName = PRODUCT_TYPE_CODES_TO_DEAL_TYPE[mockProductTypeCode as keyof typeof PRODUCT_TYPE_CODES_TO_DEAL_TYPE];

      const expected = `${CONSUMER} ${mockFacilityType} ${expectedProductName}: ${mockBankInternalRefName}`;

      expect(result).toEqual(expected);
    });

    describe('when facilityType is not provided', () => {
      it('should return the facility name without a facility type', () => {
        // Arrange
        const mockProductTypeCode = PRODUCT_TYPE_CODES.GEF;

        const params = {
          bankInternalRefName: mockBankInternalRefName,
          isGefDeal: true,
          productTypeCode: mockProductTypeCode,
        };

        // Act
        const result = mapFacilityName(params);

        // Assert
        const expectedProductName = PRODUCT_TYPE_CODES_TO_DEAL_TYPE[mockProductTypeCode as keyof typeof PRODUCT_TYPE_CODES_TO_DEAL_TYPE];

        const expected = `${CONSUMER} ${expectedProductName}: ${mockBankInternalRefName}`;

        expect(result).toEqual(expected);
      });
    });

    describe('when facilityType is an empty string', () => {
      it('should return the facility name without a facility type', () => {
        // Arrange
        const mockProductTypeCode = PRODUCT_TYPE_CODES.GEF;

        const params = {
          bankInternalRefName: mockBankInternalRefName,
          facilityType: '',
          isGefDeal: true,
          productTypeCode: mockProductTypeCode,
        };

        // Act
        const result = mapFacilityName(params);

        // Assert
        const expectedProductName = PRODUCT_TYPE_CODES_TO_DEAL_TYPE[mockProductTypeCode as keyof typeof PRODUCT_TYPE_CODES_TO_DEAL_TYPE];

        const expected = `${CONSUMER} ${expectedProductName}: ${mockBankInternalRefName}`;

        expect(result).toEqual(expected);
      });
    });
  });

  describe('when isGefDeal is false', () => {
    it('should return the facility name with just the product type code', () => {
      // Arrange
      const mockFacilityType = FACILITY_TYPE.BOND;
      const mockProductTypeCode = PRODUCT_TYPE_CODES.BSS;

      const params = {
        bankInternalRefName: mockBankInternalRefName,
        facilityType: mockFacilityType,
        isGefDeal: false,
        productTypeCode: mockProductTypeCode,
      };

      // Act
      const result = mapFacilityName(params);

      // Assert
      const expectedProductName = PRODUCT_TYPE_CODES_TO_DEAL_TYPE[mockProductTypeCode as keyof typeof PRODUCT_TYPE_CODES_TO_DEAL_TYPE];

      const expected = `${CONSUMER} ${expectedProductName}: ${mockBankInternalRefName}`;

      expect(result).toEqual(expected);
    });
  });
});
