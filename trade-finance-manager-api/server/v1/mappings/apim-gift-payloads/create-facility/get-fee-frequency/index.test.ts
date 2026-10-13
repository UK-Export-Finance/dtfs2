import { Facility } from '@ukef/dtfs2-common';
import { getFeeFrequency } from '.';
import { MOCK_FACILITIES } from '../../../../__mocks__/mock-facilities';

const mockFacilitySnapshot = MOCK_FACILITIES[1] as unknown as Facility;

describe('getFeeFrequency', () => {
  describe('when isEwcsFacility is true', () => {
    it('should return the correct fee frequency', () => {
      // Arrange
      const params = {
        facilitySnapshot: {
          ...mockFacilitySnapshot,
          premiumFrequency: 'Mock Premium Frequency',
        },
        isEwcsFacility: true,
      };

      // Act
      const result = getFeeFrequency(params);

      // Assert
      const expected = params.facilitySnapshot.premiumFrequency;

      expect(result).toBe(expected);
    });
  });

  describe('when isEwcsFacility is true and premiumFrequency is undefined', () => {
    it('should return an empty string', () => {
      // Arrange
      const params = {
        facilitySnapshot: {
          ...mockFacilitySnapshot,
          premiumFrequency: undefined,
        },
        isEwcsFacility: true,
      };

      // Act
      const result = getFeeFrequency(params);

      // Assert
      const expected = '';

      expect(result).toBe(expected);
    });
  });

  describe('when isEwcsFacility is false', () => {
    it('should return the correct fee frequency', () => {
      // Arrange
      const params = {
        facilitySnapshot: {
          ...mockFacilitySnapshot,
          feeFrequency: 'Mock fee frequency',
        },
        isEwcsFacility: false,
      };

      // Act
      const result = getFeeFrequency(params);

      // Assert
      const expected = params.facilitySnapshot.feeFrequency;

      expect(result).toBe(expected);
    });
  });

  describe('when isEwcsFacility is false and feeFrequency is undefined', () => {
    it('should return an empty string', () => {
      // Arrange
      const params = {
        facilitySnapshot: {
          ...mockFacilitySnapshot,
          feeFrequency: undefined,
        },
        isEwcsFacility: false,
      };

      // Act
      const result = getFeeFrequency(params);

      // Assert
      const expected = '';

      expect(result).toBe(expected);
    });
  });
});
