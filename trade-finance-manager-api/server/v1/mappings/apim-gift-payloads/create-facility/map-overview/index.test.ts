import { GEF_FACILITY_TYPE } from '@ukef/dtfs2-common';
import { APIM_GIFT_INTEGRATION, PRODUCT_TYPE_CODES } from '../../constants';
import { mapOverview } from '.';
import { mapFacilityName } from './map-facility-name';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

describe('mapOverview', () => {
  const baseParams = {
    bankInternalRefName: 'Mock internal reference name',
    currency: 'GBP',
    effectiveDate: '2026-01-30',
    expiryDate: '2026-12-31',
    exporterPartyUrn: '12345',
    facilityAmount: 20000,
    facilityCategoryCode: GEF_FACILITY_TYPE.CASH,
    facilityName: 'Mock facility name',
    isGefDeal: true,
    ukefFacilityId: '123',
  };

  const { bankInternalRefName, exporterPartyUrn, facilityCategoryCode, isGefDeal, ukefFacilityId, ...otherParams } = baseParams;

  const baseExpected = {
    ...otherParams,
    facilityId: ukefFacilityId,
    obligorUrn: exporterPartyUrn,
  };

  describe(PRODUCT_TYPE_CODES.BSS, () => {
    it('should map TFM facility data to the format expected by APIM GIFT for facility creation', () => {
      // Arrange
      const productTypeCode = PRODUCT_TYPE_CODES.BSS;

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
        facilityName: mapFacilityName({
          bankInternalRefName,
          facilityCategoryCode,
          isGefDeal,
          productTypeCode,
        }),
        isRevolving: DEFAULTS.OVERVIEW.IS_REVOLVING.BSS,
        productTypeCode,
      };

      expect(result).toEqual(expected);
    });
  });

  describe(PRODUCT_TYPE_CODES.GEF, () => {
    it('should map TFM facility data to the format expected by APIM GIFT for facility creation', () => {
      // Arrange
      const productTypeCode = PRODUCT_TYPE_CODES.GEF;

      const params = {
        ...baseParams,
        productTypeCode,
      };

      // Act
      const result = mapOverview(params);

      // Assert
      const expected = {
        ...baseExpected,
        creditType: DEFAULTS.OVERVIEW.CREDIT_TYPE.GEF,
        facilityName: mapFacilityName({
          bankInternalRefName,
          facilityCategoryCode,
          isGefDeal,
          productTypeCode,
        }),
        isRevolving: DEFAULTS.OVERVIEW.IS_REVOLVING.GEF,
        productTypeCode,
      };

      expect(result).toEqual(expected);
    });
  });
});
