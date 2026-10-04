import { Facility } from '@ukef/dtfs2-common';
import { getFeeType } from '.';
import { MOCK_FACILITIES } from '../../../../__mocks__/mock-facilities';

const mockFacilitySnapshot = MOCK_FACILITIES[1] as unknown as Facility;

describe('getFeeType', () => {
  describe('when isEwcsFacility is true', () => {
    it('should return the correct fee type', () => {
      // Arrange
      const params = {
        facilitySnapshot: {
          ...mockFacilitySnapshot,
          premiumType: 'Mock Premium Type',
        },
        isEwcsFacility: true,
      };

      // Act
      const result = getFeeType(params);

      // Assert
      const expected = params.facilitySnapshot.premiumType;

      expect(result).toBe(expected);
    });
  });

  describe('when isEwcsFacility is true and premiumType is undefined', () => {
    it('should return an empty string', () => {
      // Arrange
      const params = {
        facilitySnapshot: {
          ...mockFacilitySnapshot,
          premiumType: undefined,
        },
        isEwcsFacility: true,
      };

      // Act
      const result = getFeeType(params);

      // Assert
      const expected = '';

      expect(result).toBe(expected);
    });
  });

  describe('when isEwcsFacility is false', () => {
    it('should return the correct fee type', () => {
      // Arrange
      const params = {
        facilitySnapshot: {
          ...mockFacilitySnapshot,
          feeType: 'Mock fee type',
        },
        isEwcsFacility: false,
      };

      // Act
      const result = getFeeType(params);

      // Assert
      const expected = params.facilitySnapshot.feeType;

      expect(result).toBe(expected);
    });
  });

  describe('when isEwcsFacility is false and feeType is undefined', () => {
    it('should return an empty string', () => {
      // Arrange
      const params = {
        facilitySnapshot: {
          ...mockFacilitySnapshot,
          feeType: undefined,
        },
        isEwcsFacility: false,
      };

      // Act
      const result = getFeeType(params);

      // Assert
      const expected = '';

      expect(result).toBe(expected);
    });
  });
});
