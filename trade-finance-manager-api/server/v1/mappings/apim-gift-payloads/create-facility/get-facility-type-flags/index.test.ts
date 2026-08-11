import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { getFacilityTypeFlags } from '.';

describe('getFacilityTypeFlags', () => {
  describe(`when facilityType is ${FACILITY_TYPE.BOND}`, () => {
    it('should return an object with isBssFacility as true', () => {
      // Arrange
      const mockFacilityType = FACILITY_TYPE.BOND;

      // Act
      const result = getFacilityTypeFlags(mockFacilityType);

      // Assert
      const expected = {
        isBssFacility: true,
        isEwcsFacility: false,
        isGefFacility: false,
        facilityType: mockFacilityType,
      };

      expect(result).toEqual(expected);
    });
  });

  describe(`when facilityType is ${FACILITY_TYPE.LOAN}`, () => {
    it('should return an object with isEwcsFacility as true', () => {
      // Arrange
      const mockFacilityType = FACILITY_TYPE.LOAN;

      // Act
      const result = getFacilityTypeFlags(mockFacilityType);

      // Assert
      const expected = {
        isBssFacility: false,
        isEwcsFacility: true,
        isGefFacility: false,
        facilityType: mockFacilityType,
      };

      expect(result).toEqual(expected);
    });
  });

  describe(`when facilityType is ${FACILITY_TYPE.CASH}`, () => {
    it('should return an object with isGefFacility as true', () => {
      // Arrange
      const mockFacilityType = FACILITY_TYPE.CASH;

      // Act
      const result = getFacilityTypeFlags(mockFacilityType);

      // Assert
      const expected = {
        isBssFacility: false,
        isEwcsFacility: false,
        isGefFacility: true,
        facilityType: mockFacilityType,
      };

      expect(result).toEqual(expected);
    });
  });

  describe(`when facilityType is ${FACILITY_TYPE.CONTINGENT}`, () => {
    it('should return an object with isGefFacility as true', () => {
      // Arrange
      const mockFacilityType = FACILITY_TYPE.CONTINGENT;

      // Act
      const result = getFacilityTypeFlags(mockFacilityType);

      // Assert
      const expected = {
        isBssFacility: false,
        isEwcsFacility: false,
        isGefFacility: true,
        facilityType: mockFacilityType,
      };

      expect(result).toEqual(expected);
    });
  });
});
