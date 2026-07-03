import { mapFacilityAmount } from '.';

describe('mapFacilityAmount', () => {
  describe('when coverPercentage is provided', () => {
    describe('and is a percentage (1-100)', () => {
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

    describe('and is a percentage with fractional value', () => {
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

    describe('and is 0', () => {
      it('should return null', () => {
        // Arrange & Act
        const result = mapFacilityAmount({
          facilityAmount: 12345,
          coverPercentage: 0,
        });

        // Assert
        const expected = null;

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

describe('mapFacilityAmount - BSS/EWCS string value', () => {
  describe('when facilityAmount is a comma-formatted string (BSS/EWCS)', () => {
    it('should strip commas and map facility amount correctly', () => {
      // Arrange & Act
      const result = mapFacilityAmount({
        facilityAmount: '450,000.00',
        coverPercentage: 80,
      });

      // Assert
      const expected = 360000;

      expect(result).toEqual(expected);
    });

    it('should handle large comma-formatted string values', () => {
      // Arrange & Act
      const result = mapFacilityAmount({
        facilityAmount: '1,000,000.00',
        coverPercentage: 50,
      });

      // Assert
      const expected = 500000;

      expect(result).toEqual(expected);
    });
  });

  describe('when facilityAmount is a plain number (GEF)', () => {
    it('should map facility amount correctly', () => {
      // Arrange & Act
      const result = mapFacilityAmount({
        facilityAmount: 450000,
        coverPercentage: 80,
      });

      // Assert
      const expected = 360000;

      expect(result).toEqual(expected);
    });
  });
});
