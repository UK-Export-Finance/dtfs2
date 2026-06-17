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
  const facilityAmount = 1000;
  const ukefExposure = 1000;

  describe('when isGefDeal is true', () => {
    it('should return the the result of mapGefObligationAmount', () => {
      // Arrange
      const facilityType = FACILITY_TYPE.CASH;
      const isBssEwcsDeal = false;

      // Act
      const result = mapObligationAmount({
        isBssEwcsDeal,
        isGefDeal: true,
        facilityAmount,
        facilityType,
        ukefExposure,
      });

      // Assert
      const expected = mapGefObligationAmount({ facilityType, ukefExposure });

      expect(result).toEqual(expected);
    });
  });

  describe('when isBssEwcsDeal is true and isGefDeal is false', () => {
    it('should return facilityAmount', () => {
      // Arrange
      const isBssEwcsDeal = true;

      // Act
      const result = mapObligationAmount({
        isBssEwcsDeal,
        isGefDeal: false,
        facilityAmount,
        ukefExposure,
      });

      // Assert
      const expected = facilityAmount;

      expect(result).toEqual(expected);
    });

    it('should return null when facilityAmount is null', () => {
      // Arrange
      const isBssEwcsDeal = true;

      // Act
      const result = mapObligationAmount({
        isBssEwcsDeal,
        isGefDeal: false,
        facilityAmount: null,
        ukefExposure,
      });

      // Assert
      const expected = null;

      expect(result).toEqual(expected);
    });
  });

  describe('when isGefDeal is false and isBssEwcsDeal is false', () => {
    it('should return null', () => {
      // Arrange
      const isBssEwcsDeal = false;

      // Act
      const result = mapObligationAmount({
        isBssEwcsDeal,
        isGefDeal: false,
        facilityAmount,
        ukefExposure,
      });

      // Assert
      expect(result).toBeNull();
    });
  });
});
