import { calculateDrawnAmount, calculateFixedPercentage, calculateInitialUtilisation } from '.';
import { GefFacilityType } from '../../types';
import { GEF_FACILITY_TYPE, FACILITY_UTILISATION_PERCENTAGE } from '../../constants';

describe('GEF drawn amount', () => {
  describe('calculateDrawnAmount', () => {
    it('should return drawn amount for cash facility type', () => {
      // Arrange
      const facilityValue = 1000;
      const coverPercentage = 80;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;
      const expected = 680;

      // Act
      const response = calculateDrawnAmount(facilityValue, coverPercentage, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return drawn amount for contingent facility type', () => {
      // Arrange
      const facilityValue = 1000;
      const coverPercentage = 80;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;
      const expected = 560;

      // Act
      const response = calculateDrawnAmount(facilityValue, coverPercentage, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return drawn amount with decimal points for cash facility type', () => {
      // Arrange
      const facilityValue = 100.23;
      const coverPercentage = 80;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;
      const expected = 68.1564;

      // Act
      const response = calculateDrawnAmount(facilityValue, coverPercentage, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return drawn amount for contingent with decimal points facility type', () => {
      // Arrange
      const facilityValue = 100.23;
      const coverPercentage = 80;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;
      const expected = 56.128800000000005;

      // Act
      const response = calculateDrawnAmount(facilityValue, coverPercentage, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return drawn amount with decimal points with a large value for cash facility type', () => {
      // Arrange
      const facilityValue = 1000000000.23;
      const coverPercentage = 80;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;
      const expected = 680000000.1564001;

      // Act
      const response = calculateDrawnAmount(facilityValue, coverPercentage, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return drawn amount for contingent with decimal points with a large value facility type', () => {
      // Arrange
      const facilityValue = 1000000000.23;
      const coverPercentage = 80;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;
      const expected = 560000000.1288;

      // Act
      const response = calculateDrawnAmount(facilityValue, coverPercentage, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return £0 as the drawn amount for cash facility type', () => {
      // Arrange
      const facilityValue = 0;
      const coverPercentage = 10;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;
      const expected = 0;

      // Act
      const response = calculateDrawnAmount(facilityValue, coverPercentage, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return £0 as the drawn amount for contingent facility type', () => {
      // Arrange
      const facilityValue = 0;
      const coverPercentage = 10;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;
      const expected = 0;

      // Act
      const response = calculateDrawnAmount(facilityValue, coverPercentage, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return drawn amount for other facility type', () => {
      // Arrange
      const facilityValue = 1000;
      const coverPercentage = 80;
      // @ts-ignore
      const type: GefFacilityType = 'invalid';
      const expected = 80;

      // Act
      const response = calculateDrawnAmount(facilityValue, coverPercentage, type);

      // Assert
      expect(response).toEqual(expected);
    });
  });

  describe('calculateInitialUtilisation', () => {
    it('should return initial utilisation for cash facility type', () => {
      // Arrange
      const facilityValue = 1000;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;
      const expected = 850;

      // Act
      const response = calculateInitialUtilisation(facilityValue, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return £0 as the initial utilisation for cash facility type', () => {
      // Arrange
      const facilityValue = 0;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;
      const expected = 0;

      // Act
      const response = calculateInitialUtilisation(facilityValue, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return initial utilisation for contingent facility type', () => {
      // Arrange
      const facilityValue = 1000;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;
      const expected = 700;

      // Act
      const response = calculateInitialUtilisation(facilityValue, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return £0 as the initial utilisation for contingent facility type', () => {
      // Arrange
      const facilityValue = 0;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;
      const expected = 0;

      // Act
      const response = calculateInitialUtilisation(facilityValue, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return initial utilisation for other facility type', () => {
      // Arrange
      const facilityValue = 1000;
      // @ts-ignore
      const type: GefFacilityType = 'invalid';
      const expected = 100;

      // Act
      const response = calculateInitialUtilisation(facilityValue, type);

      // Assert
      expect(response).toEqual(expected);
    });
  });

  describe('calculateFixedPercentage', () => {
    it(`should return ${FACILITY_UTILISATION_PERCENTAGE.CASH} for facility type cash`, () => {
      // Arrange
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;

      // Act
      const response = calculateFixedPercentage(type);

      // Assert
      expect(response).toEqual(FACILITY_UTILISATION_PERCENTAGE.CASH);
    });

    it(`should return ${FACILITY_UTILISATION_PERCENTAGE.CONTINGENT} for facility type contingent`, () => {
      // Arrange
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;

      // Act
      const response = calculateFixedPercentage(type);

      // Assert
      expect(response).toEqual(FACILITY_UTILISATION_PERCENTAGE.CONTINGENT);
    });

    it(`should return ${FACILITY_UTILISATION_PERCENTAGE.DEFAULT} for unknown facility type`, () => {
      // Arrange
      // @ts-ignore
      const type: GefFacilityType = 'invalid';

      // Act
      const response = calculateFixedPercentage(type);

      // Assert
      expect(response).toEqual(FACILITY_UTILISATION_PERCENTAGE.DEFAULT);
    });
  });
});
