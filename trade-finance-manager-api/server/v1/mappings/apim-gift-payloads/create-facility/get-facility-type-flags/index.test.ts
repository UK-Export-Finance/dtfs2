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
        isCashFacility: false,
        isContingentFacility: false,
        isEwcsFacility: false,
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
        isCashFacility: false,
        isContingentFacility: false,
        isEwcsFacility: true,
      };

      expect(result).toEqual(expected);
    });
  });

  describe(`when facilityType is ${FACILITY_TYPE.CASH}`, () => {
    it('should return an object with isCashFacility as true', () => {
      // Arrange
      const mockFacilityType = FACILITY_TYPE.CASH;

      // Act
      const result = getFacilityTypeFlags(mockFacilityType);

      // Assert
      const expected = {
        isBssFacility: false,
        isCashFacility: true,
        isContingentFacility: false,
        isEwcsFacility: false,
      };

      expect(result).toEqual(expected);
    });
  });

  describe(`when facilityType is ${FACILITY_TYPE.CONTINGENT}`, () => {
    it('should return an object with isContingentFacility as true', () => {
      // Arrange
      const mockFacilityType = FACILITY_TYPE.CONTINGENT;

      // Act
      const result = getFacilityTypeFlags(mockFacilityType);

      // Assert
      const expected = {
        isBssFacility: false,
        isCashFacility: false,
        isContingentFacility: true,
        isEwcsFacility: false,
      };

      expect(result).toEqual(expected);
    });
  });
});
