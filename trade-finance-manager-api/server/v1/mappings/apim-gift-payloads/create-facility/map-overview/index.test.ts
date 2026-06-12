import { CURRENCY, GEF_FACILITY_TYPE } from '@ukef/dtfs2-common';
import { APIM_GIFT_INTEGRATION, PRODUCT_TYPE_CODES } from '../../constants';
import { mapOverview } from '.';
import { mapFacilityAmount } from './map-facility-amount';
import { mapFacilityName } from './map-facility-name';

const { DEFAULTS } = APIM_GIFT_INTEGRATION;

describe('mapOverview', () => {
  const baseParams = {
    coverPercentage: 80,
    currency: CURRENCY.GBP,
    effectiveDate: '2026-01-30',
    expiryDate: '2026-12-31',
    exporterPartyUrn: '12345',
    facilityAmount: 20000,
    facilityType: GEF_FACILITY_TYPE.CASH,
    isGefDeal: true,
    monthsOfCover: 12,
    ukefFacilityId: '123',
  };

  const { coverPercentage, exporterPartyUrn, facilityAmount, facilityType, isGefDeal, monthsOfCover, ukefFacilityId, ...otherParams } = baseParams;

  const baseExpected = {
    ...otherParams,
    amount: mapFacilityAmount({ facilityAmount, coverPercentage }),
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
        creditType: DEFAULTS.OVERVIEW.CREDIT_TYPE.PRT003,
        name: mapFacilityName({
          facilityType,
          isGefDeal,
          monthsOfCover,
          productTypeCode,
        }),
        productTypeCode,
        repaymentType: DEFAULTS.REPAYMENT_TYPE.BULLET,
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
        creditType: DEFAULTS.OVERVIEW.CREDIT_TYPE.PRT004,
        name: mapFacilityName({
          facilityType,
          isGefDeal,
          monthsOfCover,
          productTypeCode,
        }),
        productTypeCode,
        repaymentType: DEFAULTS.REPAYMENT_TYPE.BULLET,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when exporterPartyUrn is undefined', () => {
    it('should set obligorUrn to null in the mapped overview', () => {
      // Arrange
      const productTypeCode = PRODUCT_TYPE_CODES.GEF;

      const params = {
        ...baseParams,
        productTypeCode,
        exporterPartyUrn: undefined,
      };

      // Act
      const result = mapOverview(params);

      // Assert
      expect(result.obligorUrn).toBeNull();
    });
  });
});
