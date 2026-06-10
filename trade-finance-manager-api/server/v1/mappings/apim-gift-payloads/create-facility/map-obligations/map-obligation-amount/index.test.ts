import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { mapGefObligationAmount, mapObligationAmount } from '.';
import { OBLIGATION_AMOUNT } from '../../../constants';

const { UKEF_EXPOSURE_PERCENTAGE } = OBLIGATION_AMOUNT;

describe('mapGefObligationAmount', () => {
  describe(`when facilityType is ${FACILITY_TYPE.CASH}`, () => {
    it(`should return the ukefExposure multiplied by the ${FACILITY_TYPE.CASH} percentage with decimals`, () => {
      // Arrange
      const facilityType = FACILITY_TYPE.CASH;
      const ukefExposure = 1000;

      // Act
      const result = mapGefObligationAmount({ facilityType, ukefExposure });

      // Assert
      const expectedRounded = ukefExposure * UKEF_EXPOSURE_PERCENTAGE.CASH;

      const expected = Math.round(expectedRounded * 100) / 100;

      expect(result).toEqual(expected);
    });
  });

  describe(`when facilityType is ${FACILITY_TYPE.CONTINGENT}`, () => {
    it(`should return the ukefExposure multiplied by the ${FACILITY_TYPE.CONTINGENT} percentage with decimals`, () => {
      // Arrange
      const facilityType = FACILITY_TYPE.CONTINGENT;
      const ukefExposure = 1000;

      // Act
      const result = mapGefObligationAmount({ facilityType, ukefExposure });

      // Assert
      const expectedRounded = ukefExposure * UKEF_EXPOSURE_PERCENTAGE.CONTINGENT;

      const expected = Math.round(expectedRounded * 100) / 100;

      expect(result).toEqual(expected);
    });
  });

  describe(`when facilityType is not ${FACILITY_TYPE.CASH} or ${FACILITY_TYPE.CONTINGENT}`, () => {
    it('should return null', () => {
      // Arrange
      const facilityType = FACILITY_TYPE.BOND;
      const ukefExposure = 1000;

      // Act
      const result = mapGefObligationAmount({ facilityType, ukefExposure });

      // Assert
      expect(result).toBeNull();
    });
  });
});

describe('mapObligationAmount', () => {
  const ukefExposure = 1000;
  const facilityAmount = 1200;
  const coverPercentage = 0.8;

  describe('when isGefDeal is true', () => {
    it('should return the the result of mapGefObligationAmount', () => {
      // Arrange
      const facilityType = FACILITY_TYPE.CASH;
      const isBssEwcsDeal = false;

      // Act
      const result = mapObligationAmount({
        coverPercentage,
        facilityAmount,
        isBssEwcsDeal,
        isGefDeal: true,
        facilityType,
        ukefExposure,
      });

      // Assert
      const expected = mapGefObligationAmount({ facilityType, ukefExposure });

      expect(result).toEqual(expected);
    });
  });

  describe('when isBssEwcsDeal is true, isGefDeal is false and coverPercentage is provided', () => {
    it('should return facilityAmount multiplied by coverPercentage', () => {
      // Arrange
      const isBssEwcsDeal = true;

      // Act
      const result = mapObligationAmount({
        coverPercentage,
        facilityAmount,
        isBssEwcsDeal,
        isGefDeal: false,
        ukefExposure,
      });

      // Assert
      const expected = facilityAmount * coverPercentage;

      expect(result).toEqual(expected);
    });
  });

  describe('when isBssEwcsDeal is true, isGefDeal is false and coverPercentage is null', () => {
    it('should return null', () => {
      // Arrange
      const isBssEwcsDeal = true;

      // Act
      const result = mapObligationAmount({
        coverPercentage: null,
        facilityAmount,
        isBssEwcsDeal,
        isGefDeal: false,
        ukefExposure,
      });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('when isGefDeal is false and isBssEwcsDeal is false', () => {
    it('should return null', () => {
      // Arrange
      const isBssEwcsDeal = false;

      // Act
      const result = mapObligationAmount({
        coverPercentage,
        facilityAmount,
        isBssEwcsDeal,
        isGefDeal: false,
        ukefExposure,
      });

      // Assert
      expect(result).toBeNull();
    });
  });
});
