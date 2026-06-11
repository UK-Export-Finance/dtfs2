import { TfmFacilitySnapshot } from '@ukef/dtfs2-common';
import { mapCoverPercentage, toNumber } from '.';

describe('toNumber', () => {
  it('should parse a plain numeric string', () => {
    expect(toNumber('80')).toEqual(80);
  });

  it('should strip a percentage sign', () => {
    expect(toNumber('80%')).toEqual(80);
  });

  it('should strip comma separators', () => {
    expect(toNumber('1,000')).toEqual(1000);
  });

  it('should accept a number directly', () => {
    expect(toNumber(75)).toEqual(75);
  });

  it('should return null for an empty string', () => {
    expect(toNumber('')).toBeNull();
  });

  it('should return null for null', () => {
    expect(toNumber(null)).toBeNull();
  });

  it('should return null for undefined', () => {
    expect(toNumber(undefined)).toBeNull();
  });

  it('should return null for a non-numeric string', () => {
    expect(toNumber('not-a-number')).toBeNull();
  });
});

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
