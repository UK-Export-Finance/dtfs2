import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { mapGefObligationAmount, mapObligationAmount } from '.';
import { OBLIGATION_AMOUNT } from '../../../constants';

const { UKEF_EXPOSURE_PERCENTAGE } = OBLIGATION_AMOUNT;

const facilityAmount = 1000;

describe('mapGefObligationAmount', () => {
  describe('when isCashFacility is true', () => {
    // Arrange
    const isCashFacility = true;
    const isContingentFacility = false;

    it(`should return the facilityAmount multiplied by the ${FACILITY_TYPE.CASH} percentage with decimals`, () => {
      // Act
      const result = mapGefObligationAmount({ facilityAmount, isCashFacility, isContingentFacility });

      // Assert
      const expected = Number((facilityAmount * UKEF_EXPOSURE_PERCENTAGE.CASH).toFixed(2));

      expect(result).toEqual(expected);
    });

    describe('when facilityAmount is null', () => {
      it('should return null', () => {
        // Act
        const result = mapGefObligationAmount({ facilityAmount: null, isCashFacility, isContingentFacility });

        // Assert
        expect(result).toBeNull();
      });
    });
  });

  describe('when isContingentFacility is true', () => {
    // Arrange
    const isCashFacility = false;
    const isContingentFacility = true;

    it(`should return the facilityAmount multiplied by the ${FACILITY_TYPE.CONTINGENT} percentage with decimals`, () => {
      // Act
      const result = mapGefObligationAmount({ facilityAmount, isCashFacility, isContingentFacility });

      // Assert
      const expected = Number((facilityAmount * UKEF_EXPOSURE_PERCENTAGE.CONTINGENT).toFixed(2));

      expect(result).toEqual(expected);
    });

    describe('when facilityAmount is null', () => {
      it('should return null', () => {
        // Act
        const result = mapGefObligationAmount({ facilityAmount: null, isCashFacility, isContingentFacility });

        // Assert
        expect(result).toBeNull();
      });
    });
  });

  describe('when isCashFacility and isContingentFacility are both false', () => {
    it('should return null', () => {
      // Arrange
      const isCashFacility = false;
      const isContingentFacility = false;

      // Act
      const result = mapGefObligationAmount({ facilityAmount, isCashFacility, isContingentFacility });

      // Assert
      expect(result).toBeNull();
    });
  });
});

describe('mapObligationAmount', () => {
  describe('when isBssFacility is true', () => {
    // Arrange
    const isBssFacility = true;
    const isEwcsFacility = false;
    const isCashFacility = false;
    const isContingentFacility = false;

    it('should return facilityAmount', () => {
      // Act
      const result = mapObligationAmount({
        facilityAmount,
        isBssFacility,
        isEwcsFacility,
        isCashFacility,
        isContingentFacility,
      });

      // Assert
      const expected = facilityAmount;

      expect(result).toEqual(expected);
    });

    it('should return null when facilityAmount is null', () => {
      // Act
      const result = mapObligationAmount({
        facilityAmount: null,
        isBssFacility,
        isEwcsFacility,
        isCashFacility,
        isContingentFacility,
      });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('when isCashFacility is true', () => {
    it('should return the the result of mapGefObligationAmount', () => {
      // Arrange
      const isBssFacility = false;
      const isEwcsFacility = false;
      const isCashFacility = true;
      const isContingentFacility = false;

      // Act
      const result = mapObligationAmount({
        facilityAmount,
        isBssFacility,
        isCashFacility,
        isContingentFacility,
        isEwcsFacility,
      });

      // Assert
      const expected = mapGefObligationAmount({ facilityAmount, isCashFacility, isContingentFacility });

      expect(result).toEqual(expected);
    });
  });

  describe('when isContingentFacility is true', () => {
    it('should return the the result of mapGefObligationAmount', () => {
      // Arrange
      const isBssFacility = false;
      const isEwcsFacility = false;
      const isCashFacility = false;
      const isContingentFacility = true;

      // Act
      const result = mapObligationAmount({
        facilityAmount,
        isBssFacility,
        isCashFacility,
        isContingentFacility,
        isEwcsFacility,
      });

      // Assert
      const expected = mapGefObligationAmount({ facilityAmount, isCashFacility, isContingentFacility });

      expect(result).toEqual(expected);
    });
  });

  describe('when all provided flags are false', () => {
    it('should return null', () => {
      // Arrange
      const isBssFacility = false;
      const isEwcsFacility = false;
      const isCashFacility = false;
      const isContingentFacility = false;

      // Act
      const result = mapObligationAmount({
        facilityAmount,
        isBssFacility,
        isEwcsFacility,
        isCashFacility,
        isContingentFacility,
      });

      // Assert
      expect(result).toBeNull();
    });
  });
});
