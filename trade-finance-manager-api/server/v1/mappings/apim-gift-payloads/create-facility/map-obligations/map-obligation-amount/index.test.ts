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

  describe('when isGefDeal is true', () => {
    it('should return the the result of mapGefObligationAmount', () => {
      // Arrange
      const facilityType = FACILITY_TYPE.CASH;

      // Act
      const result = mapObligationAmount({ isGefDeal: true, facilityType, ukefExposure });

      // Assert
      const expected = mapGefObligationAmount({ facilityType, ukefExposure });

      expect(result).toEqual(expected);
    });
  });

  describe('when isGefDeal is false', () => {
    it('should return the provided ukefExposure', () => {
      // Act
      const result = mapObligationAmount({ isGefDeal: false, ukefExposure });

      // Assert
      expect(result).toEqual(ukefExposure);
    });
  });
});
