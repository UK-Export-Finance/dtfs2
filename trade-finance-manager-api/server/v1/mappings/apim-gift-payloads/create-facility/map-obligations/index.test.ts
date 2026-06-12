import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { APIM_GIFT_INTEGRATION } from '../../constants';
import { mapObligations } from '.';
import { mapObligationAmount } from './map-obligation-amount';

const { DEFAULTS, OBLIGATION_SUBTYPE_MAP } = APIM_GIFT_INTEGRATION;

describe('mapObligations', () => {
  const bssSubtypeName = 'Performance bond';
  const currency = 'GBP';
  const facilityType = FACILITY_TYPE.CASH;
  const ukefExposure = 1500;

  describe('when isBssEwcsDeal is true', () => {
    it('should return an array with one obligation and mapped subtypeCode', () => {
      // Arrange
      const isBssEwcsDeal = true;
      const isGefDeal = false;

      // Act
      const result = mapObligations({
        currency,
        isBssEwcsDeal,
        isGefDeal,
        bssSubtypeName,
        ukefExposure,
      });

      // Assert
      const expected = [
        {
          amount: mapObligationAmount({
            isBssEwcsDeal,
            isGefDeal,
            facilityType,
            ukefExposure,
          }),
          currency,
          repaymentType: DEFAULTS.REPAYMENT_TYPE.BULLET,
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
          isBssEwcsDeal,
          isGefDeal,
          bssSubtypeName: unmappedBssSubtypeName,
          ukefExposure,
        });

        // Assert
        const expected = [
          {
            amount: mapObligationAmount({
              isBssEwcsDeal,
              isGefDeal,
              facilityType,
              ukefExposure,
            }),
            currency,
            repaymentType: DEFAULTS.REPAYMENT_TYPE.BULLET,
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
        isBssEwcsDeal,
        isGefDeal,
        facilityType,
        ukefExposure,
      });

      // Assert
      const expected = [
        {
          amount: mapObligationAmount({
            isBssEwcsDeal,
            isGefDeal,
            facilityType,
            ukefExposure,
          }),
          currency,
          repaymentType: DEFAULTS.REPAYMENT_TYPE.BULLET,
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
        isBssEwcsDeal,
        isGefDeal,
        ukefExposure,
      });

      // Assert
      const expected = [
        {
          amount: mapObligationAmount({
            isBssEwcsDeal,
            isGefDeal,
            facilityType,
            ukefExposure,
          }),
          currency,
          repaymentType: DEFAULTS.REPAYMENT_TYPE.BULLET,
          subtypeCode: null,
        },
      ];

      expect(result).toEqual(expected);
    });
  });
});
