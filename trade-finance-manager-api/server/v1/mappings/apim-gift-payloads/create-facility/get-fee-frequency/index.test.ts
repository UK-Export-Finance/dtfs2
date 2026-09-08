import { Facility } from '@ukef/dtfs2-common';
import { getFeeFrequency } from '.';
import { MOCK_FACILITIES } from '../../../../__mocks__/mock-facilities';

const mockFacilitySnapshot = MOCK_FACILITIES[1] as unknown as Facility;

describe('getFeeFrequency', () => {
  describe('when isEwcsFacility is true', () => {
    it('should return the correct fee frequency', () => {
      // Arrange
      const params = {
        facilitySnapshot: mockFacilitySnapshot,
        isEwcsFacility: true,
      };

      // Act
      const result = getFeeFrequency(params);

      // Assert
      const expected = mockFacilitySnapshot.premiumFrequency;

      expect(result).toBe(expected);
    });
  });

  describe('when isEwcsFacility is false', () => {
    it('should return the correct fee frequency', () => {
      // Arrange
      const params = {
        facilitySnapshot: mockFacilitySnapshot,
        isEwcsFacility: false,
      };

      // Act
      const result = getFeeFrequency(params);

      // Assert
      const expected = mockFacilitySnapshot.feeFrequency;

      expect(result).toBe(expected);
    });
  });
});
