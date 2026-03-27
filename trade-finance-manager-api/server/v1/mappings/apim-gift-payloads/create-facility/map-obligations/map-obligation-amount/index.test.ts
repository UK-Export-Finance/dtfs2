import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { mapObligationAmount } from '.';
import { OBLIGATION_AMOUNT } from '../../../constants';

const { UKEF_EXPOSURE_PERCENTAGE } = OBLIGATION_AMOUNT;

describe('mapObligationAmount', () => {
  const ukefExposure = 1000;

  describe('when isGefDeal is true', () => {
    describe(`when facilityType is ${FACILITY_TYPE.CASH}`, () => {
      it(`should return the ukefExposure multiplied by the ${FACILITY_TYPE.CASH} percentage - ${UKEF_EXPOSURE_PERCENTAGE.CASH}`, () => {
        // Arrange
        const facilityType = FACILITY_TYPE.CASH;

        // Act
        const result = mapObligationAmount({ isGefDeal: true, facilityType, ukefExposure });

        // Assert
        const expected = ukefExposure * UKEF_EXPOSURE_PERCENTAGE.CASH;

        expect(result).toBe(expected);
      });
    });

    describe(`when facilityType is ${FACILITY_TYPE.CONTINGENT}`, () => {
      it(`should return the ukefExposure multiplied by the ${FACILITY_TYPE.CONTINGENT} percentage - ${UKEF_EXPOSURE_PERCENTAGE.CONTINGENT}`, () => {
        // Arrange
        const facilityType = FACILITY_TYPE.CONTINGENT;

        // Act
        const result = mapObligationAmount({ isGefDeal: true, facilityType, ukefExposure });

        // Assert
        const expected = ukefExposure * UKEF_EXPOSURE_PERCENTAGE.CONTINGENT;

        expect(result).toBe(expected);
      });
    });

    describe(`when facilityType is not ${FACILITY_TYPE.CASH} or ${FACILITY_TYPE.CONTINGENT}`, () => {
      it('should return null', () => {
        // Arrange
        const facilityType = FACILITY_TYPE.BOND;

        // Act
        const result = mapObligationAmount({ isGefDeal: true, facilityType, ukefExposure });

        // Assert
        expect(result).toBeNull();
      });
    });
  });

  describe('when isGefDeal is false', () => {
    it('should return the provided ukefExposure', () => {
      // Act
      const result = mapObligationAmount({ isGefDeal: false, ukefExposure });

      // Assert
      expect(result).toBe(ukefExposure);
    });
  });
});
