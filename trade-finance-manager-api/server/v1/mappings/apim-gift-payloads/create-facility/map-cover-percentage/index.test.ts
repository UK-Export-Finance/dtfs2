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
  const baseParams = {
    isBssFacility: false,
    isCashFacility: false,
    isContingentFacility: false,
    isEwcsFacility: false,
  };

  describe.each([{ flag: 'isCashFacility' }, { flag: 'isContingentFacility' }])('when $flag is true', ({ flag }) => {
    it('should return the numeric coverPercentage', () => {
      // Arrange
      const facilitySnapshot = {
        coverPercentage: 80,
      } as unknown as TfmFacilitySnapshot;

      // Act
      const result = mapCoverPercentage({
        facilitySnapshot,
        ...baseParams,
        [flag]: true,
      });

      // Assert
      const expected = 80;

      expect(result).toEqual(expected);
    });
  });

  describe.each([{ flag: 'isBssFacility' }, { flag: 'isEwcsFacility' }])('when $flag is true', ({ flag }) => {
    it('should return the numeric value parsed from coveredPercentage', () => {
      // Arrange
      const facilitySnapshot = {
        coverPercentage: 0,
        coveredPercentage: '80',
      } as unknown as TfmFacilitySnapshot;

      // Act
      const result = mapCoverPercentage({
        facilitySnapshot,
        ...baseParams,
        [flag]: true,
      });

      // Assert
      const expected = 80;

      expect(result).toEqual(expected);
    });
  });

  describe('when all flags are false', () => {
    it('should return null', () => {
      // Arrange
      const facilitySnapshot = {
        coverPercentage: 75,
      } as unknown as TfmFacilitySnapshot;

      // Act
      const result = mapCoverPercentage({
        facilitySnapshot,
        ...baseParams,
      });

      // Assert
      const expected = null;

      expect(result).toEqual(expected);
    });
  });
});
