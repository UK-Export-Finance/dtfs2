import { calculateDrawnAmount, calculateInitialUtilisation } from '.';

describe('helpers/facility-calculation', () => {
  const mockFacilityValue = 150000;
  const mockCoverPercentage = 20;

  describe('calculateDrawnAmount', () => {
    it('should return correct calculation', () => {
      const result = calculateDrawnAmount(mockFacilityValue, mockCoverPercentage);

      const expected = calculateInitialUtilisation(mockFacilityValue) * (mockCoverPercentage / 100);

      expect(result).toEqual(expected);
    });
  });

  describe('calculateInitialUtilisation', () => {
    it('should return correct calculation', () => {
      const result = calculateInitialUtilisation(mockFacilityValue);

      const expected = mockFacilityValue * 0.1;

      expect(result).toEqual(expected);
    });
  });
});
