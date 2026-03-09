import { APIM_GIFT_INTEGRATION, PRODUCT_TYPES } from '../../constants';
import { mapRiskDetails, mapFacilityCategoryCode } from '.';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

describe('mapRiskDetails', () => {
  it('should map TFM facility data to the format expected by APIM GIFT for facility creation', () => {
    // Arrange
    const params = {
      dealId: '123',
      facilityCategoryCode: '',
      productTypeCode: PRODUCT_TYPES.GEF,
    };

    // Act
    const result = mapRiskDetails(params);

    // Assert
    const expected = {
      account: DEFAULTS.RISK_DETAILS.ACCOUNT,
      dealId: params.dealId,
      facilityCategoryCode: mapFacilityCategoryCode(params.productTypeCode, params.facilityCategoryCode),
      facilityCreditRating: '', // TODO: DTFS2-8318
      riskStatus: DEFAULTS.RISK_DETAILS.RISK_STATUS,
      ukefIndustryCode: '', // TODO: DTFS2-8319
    };

    expect(result).toEqual(expected);
  });
});

describe('mapFacilityCategoryCode', () => {
  describe(`when productTypeCode is "${PRODUCT_TYPES.GEF}" and a facilityCategoryCode is provided`, () => {
    it('should return the provided facilityCategoryCode', () => {
      // Arrange
      const mockProductTypeCode = PRODUCT_TYPES.GEF;
      const mockFacilityCategoryCode = 'Mock facility category code';

      // Act
      const result = mapFacilityCategoryCode(mockProductTypeCode, mockFacilityCategoryCode);

      // Assert
      const expected = mockFacilityCategoryCode;

      expect(result).toEqual(expected);
    });
  });

  describe(`when productTypeCode is "${PRODUCT_TYPES.GEF}" and a facilityCategoryCode is NOT provided`, () => {
    it('should return null', () => {
      // Arrange
      const mockProductTypeCode = PRODUCT_TYPES.GEF;

      // Act
      const result = mapFacilityCategoryCode(mockProductTypeCode);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('when productTypeCode is NOT "GEF"', () => {
    it('should return null', () => {
      // Arrange
      const mockProductTypeCode = PRODUCT_TYPES.BSS;
      const mockFacilityCategoryCode = 'Mock facility category code';

      // Act
      const result = mapFacilityCategoryCode(mockProductTypeCode, mockFacilityCategoryCode);

      // Assert
      expect(result).toBeNull();
    });
  });
});
