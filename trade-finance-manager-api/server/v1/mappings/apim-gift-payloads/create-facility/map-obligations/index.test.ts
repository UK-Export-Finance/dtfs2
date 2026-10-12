import { APIM_GIFT_INTEGRATION } from '../../constants';
import { mapObligations } from '.';
import { mapObligationAmount } from './map-obligation-amount';

const { DEFAULTS, OBLIGATION_SUBTYPE_MAP } = APIM_GIFT_INTEGRATION;

describe('mapObligations', () => {
  const bssSubtypeName = 'Performance bond';
  const currency = 'GBP';
  const facilityAmount = 1500;

  describe('when isBssFacility is true', () => {
    it('should return an array with one obligation and mapped subtypeCode', () => {
      // Arrange
      const isBssFacility = true;
      const isCashFacility = false;
      const isContingentFacility = false;
      const isEwcsFacility = false;

      // Act
      const result = mapObligations({
        bssSubtypeName,
        currency,
        isBssFacility,
        isCashFacility,
        isContingentFacility,
        isEwcsFacility,
        facilityAmount,
      });

      // Assert
      const expected = [
        {
          amount: mapObligationAmount({
            isBssFacility,
            isCashFacility,
            isContingentFacility,
            isEwcsFacility,
            facilityAmount,
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
        const isBssFacility = true;
        const isCashFacility = false;
        const isContingentFacility = false;
        const isEwcsFacility = false;
        const unmappedBssSubtypeName = 'Unmapped BSS subtype';

        // Act
        const result = mapObligations({
          bssSubtypeName: unmappedBssSubtypeName,
          currency,
          facilityAmount,
          isBssFacility,
          isCashFacility,
          isContingentFacility,
          isEwcsFacility,
        });

        // Assert
        const expected = [
          {
            amount: mapObligationAmount({
              facilityAmount,
              isBssFacility,
              isCashFacility,
              isContingentFacility,
              isEwcsFacility,
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

  describe('when isBssFacility is false', () => {
    it('should return an array with one obligation and subtypeCode as null', () => {
      // Arrange
      const isBssFacility = false;
      const isCashFacility = true;
      const isContingentFacility = false;
      const isEwcsFacility = false;

      // Act
      const result = mapObligations({
        currency,
        facilityAmount,
        isBssFacility,
        isCashFacility,
        isContingentFacility,
        isEwcsFacility,
      });

      // Assert
      const expected = [
        {
          amount: mapObligationAmount({
            facilityAmount,
            isBssFacility,
            isCashFacility,
            isContingentFacility,
            isEwcsFacility,
          }),
          currency,
          repaymentType: DEFAULTS.REPAYMENT_TYPE.BULLET,
          subtypeCode: null,
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('when isBssFacility is true and bssSubtypeName is not provided', () => {
    it('should return an array with the subtypeCode as null', () => {
      // Arrange
      const isBssFacility = true;
      const isCashFacility = false;
      const isContingentFacility = false;
      const isEwcsFacility = false;

      // Act
      const result = mapObligations({
        currency,
        facilityAmount,
        isBssFacility,
        isCashFacility,
        isContingentFacility,
        isEwcsFacility,
      });

      // Assert
      const expected = [
        {
          amount: mapObligationAmount({
            facilityAmount,
            isBssFacility,
            isCashFacility,
            isContingentFacility,
            isEwcsFacility,
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
