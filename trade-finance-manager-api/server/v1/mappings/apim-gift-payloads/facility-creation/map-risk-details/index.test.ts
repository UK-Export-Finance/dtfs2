import { APIM_GIFT_INTEGRATION } from '../../constants';
import { mapRiskDetails, mapFacilityCategoryCode } from '.';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

describe('mapRiskDetails', () => {
  it('should map TFM facility data to the format expected by APIM GIFT for facility creation', () => {
    // Arrange
    const params = {
      dealId: '123',
      facilityCategoryCode: '',
      productTypeCode: 'GEF',
    };

    // Act
    const result = mapRiskDetails(params);

    // Assert
    const expected = {
      account: DEFAULTS.RISK_DETAILS.ACCOUNT,
      dealId: params.dealId,
      facilityCategoryCode: mapFacilityCategoryCode(params.productTypeCode, params.facilityCategoryCode),
      facilityCreditRating: '', // TODO
      riskStatus: DEFAULTS.RISK_DETAILS.RISK_STATUS,
      ukefIndustryCode: '', // TODO
    };

    expect(result).toEqual(expected);
  });
});

describe('mapFacilityCategoryCode', () => {
  describe('when productTypeCode is "GEF"', () => {
    it('should return the provided facilityCategoryCode', () => {
      // Arrange
      const params = {
        dealId: '123',
        facilityCategoryCode: 'Mock facility category code',
        productTypeCode: 'GEF',
      };

      // Act
      const result = mapRiskDetails(params);

      // Assert
      const expected = params.facilityCategoryCode;

      expect(result).toEqual(expected);
    });
  });

  describe('when productTypeCode is NOT "GEF"', () => {
    it('should return null', () => {
      // Arrange
      const params = {
        dealId: '123',
        facilityCategoryCode: 'Mock facility category code',
        productTypeCode: 'NOT GEF',
      };

      // Act
      const result = mapRiskDetails(params);

      // Assert
      expect(result).toEqual(null);
    });
  });
});
