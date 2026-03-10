import { APIM_GIFT_INTEGRATION, PRODUCT_TYPES } from '../../constants';
import { mapRiskDetails, mapFacilityCategoryCode, mapFacilityCreditRating } from '.';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

describe('mapFacilityCreditRating', () => {
  describe('when the exporter credit rating is in the TFM_CREDIT_RATING_MAP', () => {
    it('should return the mapped credit rating', () => {
      // Arrange
      const mockCreditRiskRatings = ['BB-', 'B+'];
      const mockExporterCreditRating = 'Good (BB-)';

      // Act
      const result = mapFacilityCreditRating(mockCreditRiskRatings, mockExporterCreditRating);

      // Assert
      const expected = 'BB-';

      expect(result).toEqual(expected);
    });
  });

  describe('when the exporter credit rating is in the list of credit risk ratings', () => {
    it('should return the mapped credit rating', () => {
      // Arrange
      const mockCreditRiskRatings = ['AAA', 'AA+', 'AA'];
      const mockExporterCreditRating = 'AAA';

      // Act
      const result = mapFacilityCreditRating(mockCreditRiskRatings, mockExporterCreditRating);

      // Assert
      const expected = 'AAA';

      expect(result).toEqual(expected);
    });
  });

  describe('when the exporter credit rating is NOT in TFM_CREDIT_RATING_MAP or the list of credit risk ratings', () => {
    it('should return null', () => {
      // Arrange
      const mockCreditRiskRatings = ['AAA'];
      const mockExporterCreditRating = 'CCC';

      // Act
      const result = mapFacilityCreditRating(mockCreditRiskRatings, mockExporterCreditRating);

      // Assert
      expect(result).toBeNull();
    });
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

  describe(`when productTypeCode is NOT "${PRODUCT_TYPES.GEF}"`, () => {
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

describe('mapRiskDetails', () => {
  it('should map TFM facility data to the format expected by APIM GIFT for facility creation', () => {
    // Arrange
    const params = {
      dealId: '123',
      facilityCategoryCode: '',
      productTypeCode: PRODUCT_TYPES.GEF,
      creditRiskRatings: ['AAA', 'AA+', 'AA'],
      exporterCreditRating: 'AAA',
    };

    // Act
    const result = mapRiskDetails(params);

    // Assert
    const expected = {
      account: DEFAULTS.RISK_DETAILS.ACCOUNT,
      dealId: params.dealId,
      facilityCategoryCode: mapFacilityCategoryCode(params.productTypeCode, params.facilityCategoryCode),
      facilityCreditRating: mapFacilityCreditRating(params.creditRiskRatings, params.exporterCreditRating),
      riskStatus: DEFAULTS.RISK_DETAILS.RISK_STATUS,
      ukefIndustryCode: '', // TODO: DTFS2-8319
    };

    expect(result).toEqual(expected);
  });
});
