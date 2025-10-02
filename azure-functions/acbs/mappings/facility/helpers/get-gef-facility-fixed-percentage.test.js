const calculateFixedPercentage = require('./get-gef-facility-fixed-percentage');
const { FACILITY_TYPE, FACILITY_UTILISATION_PERCENTAGE } = require('../../../constants/facility');

describe('GEF drawn amount', () => {
  describe('calculateFixedPercentage', () => {
    it(`should return ${FACILITY_UTILISATION_PERCENTAGE.CASH} for facility type cash`, () => {
      // Arrange
      const type = FACILITY_TYPE.CASH;

      // Act
      const response = calculateFixedPercentage(type);

      // Assert
      expect(response).toEqual(FACILITY_UTILISATION_PERCENTAGE.CASH);
    });

    it(`should return ${FACILITY_UTILISATION_PERCENTAGE.CONTINGENT} for facility type contingent`, () => {
      // Arrange
      const type = FACILITY_TYPE.CONTINGENT;

      // Act
      const response = calculateFixedPercentage(type);

      // Assert
      expect(response).toEqual(FACILITY_UTILISATION_PERCENTAGE.CONTINGENT);
    });

    it(`should return ${FACILITY_UTILISATION_PERCENTAGE.DEFAULT} for facility type bond`, () => {
      // Arrange
      const type = FACILITY_TYPE.BOND;

      // Act
      const response = calculateFixedPercentage(type);

      // Assert
      expect(response).toEqual(FACILITY_UTILISATION_PERCENTAGE.DEFAULT);
    });

    it(`should return ${FACILITY_UTILISATION_PERCENTAGE.DEFAULT} for facility type loan`, () => {
      // Arrange
      const type = FACILITY_TYPE.LOAN;

      // Act
      const response = calculateFixedPercentage(type);

      // Assert
      expect(response).toEqual(FACILITY_UTILISATION_PERCENTAGE.DEFAULT);
    });

    it(`should return ${FACILITY_UTILISATION_PERCENTAGE.DEFAULT} for unknown facility type`, () => {
      // Arrange
      const type = 'invalid';

      // Act
      const response = calculateFixedPercentage(type);

      // Assert
      expect(response).toEqual(FACILITY_UTILISATION_PERCENTAGE.DEFAULT);
    });

    it(`should return ${FACILITY_UTILISATION_PERCENTAGE.DEFAULT} for unknown facility type`, () => {
      // Arrange
      const type = '';

      // Act
      const response = calculateFixedPercentage(type);

      // Assert
      expect(response).toEqual(FACILITY_UTILISATION_PERCENTAGE.DEFAULT);
    });

    it(`should return ${FACILITY_UTILISATION_PERCENTAGE.DEFAULT} for unknown facility type`, () => {
      // Arrange
      const type = null;

      // Act
      const response = calculateFixedPercentage(type);

      // Assert
      expect(response).toEqual(FACILITY_UTILISATION_PERCENTAGE.DEFAULT);
    });

    it(`should return ${FACILITY_UTILISATION_PERCENTAGE.DEFAULT} for unknown facility type`, () => {
      // Arrange
      const type = undefined;

      // Act
      const response = calculateFixedPercentage(type);

      // Assert
      expect(response).toEqual(FACILITY_UTILISATION_PERCENTAGE.DEFAULT);
    });
  });
});
