import { APIM_GIFT_INTEGRATION, PRODUCT_TYPE_CODES } from '../../constants';
import { mapOverview } from '.';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

describe('mapOverview', () => {
  const baseParams = {
    currency: 'GBP',
    effectiveDate: '2026-01-30',
    expiryDate: '2026-12-31',
    exporterPartyUrn: '12345',
    facilityAmount: 20000,
    facilityName: 'Mock facility name',
    ukefFacilityId: '123',
  };

  const baseExpected = {
    currency: 'GBP',
    effectiveDate: '2026-01-30',
    expiryDate: '2026-12-31',
    facilityAmount: 20000,
    facilityId: baseParams.ukefFacilityId,
    facilityName: 'Mock facility name',
    obligorUrn: baseParams.exporterPartyUrn,
  };

  describe(PRODUCT_TYPE_CODES.BSS, () => {
    it('should map TFM facility data to the format expected by APIM GIFT for facility creation', () => {
      // Arrange
      const params = {
        ...baseParams,
        productTypeCode: PRODUCT_TYPE_CODES.BSS,
      };

      // Act
      const result = mapOverview(params);

      // Assert
      const expected = {
        ...baseExpected,
        creditType: DEFAULTS.OVERVIEW.CREDIT_TYPE.BSS,
        isRevolving: DEFAULTS.OVERVIEW.IS_REVOLVING.BSS,
        productTypeCode: PRODUCT_TYPE_CODES.BSS,
      };

      expect(result).toEqual(expected);
    });
  });

  describe(PRODUCT_TYPE_CODES.GEF, () => {
    it('should map TFM facility data to the format expected by APIM GIFT for facility creation', () => {
      // Arrange
      const params = {
        ...baseParams,
        productTypeCode: PRODUCT_TYPE_CODES.GEF,
      };

      // Act
      const result = mapOverview(params);

      // Assert
      const expected = {
        ...baseExpected,
        creditType: DEFAULTS.OVERVIEW.CREDIT_TYPE.GEF,
        isRevolving: DEFAULTS.OVERVIEW.IS_REVOLVING.GEF,
        productTypeCode: PRODUCT_TYPE_CODES.GEF,
      };

      expect(result).toEqual(expected);
    });
  });
});
