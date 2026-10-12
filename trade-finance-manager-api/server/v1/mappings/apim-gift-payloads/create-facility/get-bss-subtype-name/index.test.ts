import type { TfmFacilitySnapshot } from '@ukef/dtfs2-common';
import { getBssSubtypeName } from '.';

const mockFacilitySnapshot = {
  bondType: 'Mock Bond Type',
} as unknown as TfmFacilitySnapshot;

describe('getBssSubtypeName', () => {
  describe(`when isBssFacility is true`, () => {
    it('should return the bondType from the facility snapshot', () => {
      // Arrange
      const params = {
        facilitySnapshot: mockFacilitySnapshot,
        isBssFacility: true,
      };

      // Act
      const result = getBssSubtypeName(params);

      // Assert
      const expected = String(mockFacilitySnapshot.bondType);

      expect(result).toEqual(expected);
    });
  });

  describe(`when isBssFacility is false`, () => {
    it('should return undefined', () => {
      // Arrange
      const params = {
        facilitySnapshot: mockFacilitySnapshot,
        isBssFacility: false,
      };

      // Act
      const result = getBssSubtypeName(params);

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
