import { TfmFacilitySnapshot } from '@ukef/dtfs2-common';
import { mapCoverPercentage } from '.';

describe('mapCoverPercentage', () => {
  describe('when isGefDeal is true', () => {
    it('should return the numeric coverPercentage', () => {
      // Arrange
      const facilitySnapshot = {
        coverPercentage: 80,
      } as unknown as TfmFacilitySnapshot;

      // Act
      const result = mapCoverPercentage({
        facilitySnapshot,
        isBssEwcsDeal: false,
        isGefDeal: true,
      });

      // Assert
      const expected = facilitySnapshot.coverPercentage;

      expect(result).toEqual(expected);
    });
  });

  describe('when isBssEwcsDeal is true', () => {
    it('should return the numeric value parsed from coveredPercentage', () => {
      // Arrange
      const facilitySnapshot = {
        coverPercentage: 0,
        coveredPercentage: '80',
      } as unknown as TfmFacilitySnapshot;

      // Act
      const result = mapCoverPercentage({
        facilitySnapshot,
        isBssEwcsDeal: true,
        isGefDeal: false,
      });

      // Assert
      const expected = 80;

      expect(result).toEqual(expected);
    });
  });

  describe('when the deal type flags are both false', () => {
    it('should return null', () => {
      // Arrange
      const facilitySnapshot = {
        coverPercentage: 75,
      } as unknown as TfmFacilitySnapshot;

      // Act
      const result = mapCoverPercentage({
        facilitySnapshot,
        isBssEwcsDeal: false,
        isGefDeal: false,
      });

      // Assert
      const expected = null;

      expect(result).toEqual(expected);
    });
  });
});
