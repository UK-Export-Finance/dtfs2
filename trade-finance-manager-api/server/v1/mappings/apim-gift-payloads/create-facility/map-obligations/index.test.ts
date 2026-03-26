import { APIM_GIFT_INTEGRATION } from '../../constants';
import { mapObligations } from '.';

const { OBLIGATION_SUBTYPE_MAP } = APIM_GIFT_INTEGRATION;

describe('mapObligations', () => {
  const currency = 'GBP';
  const effectiveDate = '2024-01-28';
  const maturityDate = '2026-02-14';
  const bssSubtypeName = 'Performance bond';
  const ukefExposure = 1500;

  describe('when isBssEwcsDeal is true', () => {
    it('should return an array with one obligation and mapped subtypeCode', () => {
      // Arrange
      const isBssEwcsDeal = true;

      // Act
      const result = mapObligations({
        currency,
        effectiveDate,
        isBssEwcsDeal,
        maturityDate,
        bssSubtypeName,
        ukefExposure,
      });

      // Assert
      const expected = [
        {
          amount: ukefExposure,
          currency,
          effectiveDate,
          maturityDate,
          subtypeCode: OBLIGATION_SUBTYPE_MAP.BSS['Performance bond'],
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('when isBssEwcsDeal is false', () => {
    it('should return an array with one obligation and subtypeCode as null', () => {
      // Arrange
      const isBssEwcsDeal = false;

      // Act
      const result = mapObligations({
        currency,
        effectiveDate,
        isBssEwcsDeal,
        maturityDate,
        bssSubtypeName,
        ukefExposure,
      });

      // Assert
      const expected = [
        {
          amount: ukefExposure,
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
