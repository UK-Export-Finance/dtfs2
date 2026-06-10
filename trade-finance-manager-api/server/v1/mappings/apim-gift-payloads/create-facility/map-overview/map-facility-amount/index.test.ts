import { mapFacilityAmount } from '.';

describe('mapFacilityAmount', () => {
  describe('when coverPercentage is provided', () => {
    describe('and is a whole number', () => {
      it('should map facility amount correctly', () => {
        // Arrange & Act
        const result = mapFacilityAmount({
          facilityAmount: 12345,
          coverPercentage: 20,
        });

        // Assert
        const expected = 2469;

        expect(result).toEqual(expected);
      });
    });

    describe('and is 0', () => {
      it('should return 0', () => {
        // Arrange & Act
        const result = mapFacilityAmount({
          facilityAmount: 12345,
          coverPercentage: 0,
        });

        // Assert
        const expected = 0;

        expect(result).toEqual(expected);
      });
    });

    describe('and is a decimal', () => {
      it('should map facility amount correctly', () => {
        // Arrange & Act
        const result = mapFacilityAmount({
          facilityAmount: 1000,
          coverPercentage: 12.5,
        });

        // Assert
        const expected = 125;

        expect(result).toEqual(expected);
      });
    });
  });

  describe('when coverPercentage is null', () => {
    it('should return null', () => {
      // Arrange & Act
      const result = mapFacilityAmount({
        facilityAmount: 1000,
        coverPercentage: null,
      });

      // Assert
      expect(result).toBeNull();
    });
  });
});
