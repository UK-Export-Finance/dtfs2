import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { mapGefObligationAmount, mapObligationAmount } from '.';
import { OBLIGATION_AMOUNT } from '../../../constants';

const { UKEF_EXPOSURE_PERCENTAGE } = OBLIGATION_AMOUNT;

const facilityAmount = 1000;

describe('mapGefObligationAmount', () => {
  describe(`when facilityType is ${FACILITY_TYPE.CASH}`, () => {
    it(`should return the facilityAmount multiplied by the ${FACILITY_TYPE.CASH} percentage with decimals`, () => {
      // Arrange
      const facilityType = FACILITY_TYPE.CASH;

      // Act
      const result = mapGefObligationAmount({ facilityType, facilityAmount });

      // Assert
      const expectedRounded = facilityAmount * UKEF_EXPOSURE_PERCENTAGE.CASH;

      const expected = Math.round(expectedRounded * 100) / 100;

      expect(result).toEqual(expected);
    });
  });

  describe('when facilityAmount is null', () => {
    it('should return null', () => {
      // Arrange
      const facilityType = FACILITY_TYPE.CASH;

      // Act
      const result = mapGefObligationAmount({ facilityType, facilityAmount: null });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe(`when facilityType is ${FACILITY_TYPE.CONTINGENT}`, () => {
    it(`should return the facilityAmount multiplied by the ${FACILITY_TYPE.CONTINGENT} percentage with decimals`, () => {
      // Arrange
      const facilityType = FACILITY_TYPE.CONTINGENT;

      // Act
      const result = mapGefObligationAmount({ facilityType, facilityAmount });

      // Assert
      const expectedRounded = facilityAmount * UKEF_EXPOSURE_PERCENTAGE.CONTINGENT;

      const expected = Math.round(expectedRounded * 100) / 100;

      expect(result).toEqual(expected);
    });
  });

  describe(`when facilityType is not ${FACILITY_TYPE.CASH} or ${FACILITY_TYPE.CONTINGENT}`, () => {
    it('should return null', () => {
      // Arrange
      const facilityType = FACILITY_TYPE.BOND;

      // Act
      const result = mapGefObligationAmount({ facilityType, facilityAmount });

      // Assert
      expect(result).toBeNull();
    });
  });
});

describe('mapObligationAmount', () => {
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
      });

      // Assert
      const expected = mapGefObligationAmount({ facilityType, facilityAmount });

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
        isBssEwcsDeal,
        isGefDeal: false,
        facilityAmount,
      });

      // Assert
      expect(result).toBeNull();
    });
  });
});
