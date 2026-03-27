import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { APIM_GIFT_INTEGRATION } from '../../constants';
import { mapObligations } from '.';
import { mapObligationAmount } from './map-obligation-amount';

const { OBLIGATION_SUBTYPE_MAP } = APIM_GIFT_INTEGRATION;

describe('mapObligations', () => {
  const bssSubtypeName = 'Performance bond';
  const currency = 'GBP';
  const effectiveDate = '2024-01-28';
  const facilityType = FACILITY_TYPE.CASH;
  const maturityDate = '2026-02-14';
  const ukefExposure = 1500;

  describe('when isBssEwcsDeal is true', () => {
    it('should return an array with one obligation and mapped subtypeCode', () => {
      // Arrange
      const isBssEwcsDeal = true;
      const isGefDeal = false;

      // Act
      const result = mapObligations({
        currency,
        effectiveDate,
        isBssEwcsDeal,
        isGefDeal,
        maturityDate,
        bssSubtypeName,
        ukefExposure,
      });

      // Assert
      const expected = [
        {
          amount: mapObligationAmount({ isGefDeal, facilityType, ukefExposure }),
          currency,
          effectiveDate,
          maturityDate,
          subtypeCode: OBLIGATION_SUBTYPE_MAP.BSS['Performance bond'],
        },
      ];

      expect(result).toEqual(expected);
    });

    describe('when bssSubtypeName is not mapped to an obligation subtype code', () => {
      it('should return an array with the subtypeCode as null', () => {
        // Arrange
        const isBssEwcsDeal = true;
        const isGefDeal = false;
        const unmappedBssSubtypeName = 'Unmapped BSS subtype';

        // Act
        const result = mapObligations({
          currency,
          effectiveDate,
          isBssEwcsDeal,
          isGefDeal,
          maturityDate,
          bssSubtypeName: unmappedBssSubtypeName,
          ukefExposure,
        });

        // Assert
        const expected = [
          {
            amount: mapObligationAmount({ isGefDeal, facilityType, ukefExposure }),
            currency,
            effectiveDate,
            maturityDate,
            subtypeCode: null,
          },
        ];

        expect(result).toEqual(expected);
      });
    });
  });

  describe('when isBssEwcsDeal is false', () => {
    it('should return an array with one obligation and subtypeCode as null', () => {
      // Arrange
      const isBssEwcsDeal = false;
      const isGefDeal = true;

      // Act
      const result = mapObligations({
        currency,
        effectiveDate,
        isBssEwcsDeal,
        isGefDeal,
        facilityType,
        maturityDate,
        ukefExposure,
      });

      // Assert
      const expected = [
        {
          amount: mapObligationAmount({ isGefDeal, facilityType, ukefExposure }),
          currency,
          effectiveDate,
          maturityDate,
          subtypeCode: null,
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('when isBssEwcsDeal is true and bssSubtypeName is not provided', () => {
    it('should return an array with the subtypeCode as null', () => {
      // Arrange
      const isBssEwcsDeal = true;
      const isGefDeal = false;

      // Act
      const result = mapObligations({
        currency,
        effectiveDate,
        isBssEwcsDeal,
        isGefDeal,
        maturityDate,
        ukefExposure,
      });

      // Assert
      const expected = [
        {
          amount: mapObligationAmount({ isGefDeal, facilityType, ukefExposure }),
          currency,
          effectiveDate,
          maturityDate,
          subtypeCode: null,
        },
      ];

      expect(result).toEqual(expected);
    });
  });
});
