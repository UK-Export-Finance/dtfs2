import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { mapFacilityCategoryCode } from '.';

const mockFacilityCategories = [
  {
    type: 'Facility Category',
    typeCode: 'facilityCategory',
    code: 'FCT003',
    description: 'Bond: Supplemental To Credit',
    isActive: true,
  },
  {
    type: 'Facility Category',
    typeCode: 'facilityCategory',
    code: 'FCT006',
    description: 'GEF: Contingent',
    isActive: true,
  },
  {
    type: 'Facility Category',
    typeCode: 'facilityCategory',
    code: 'FCT007',
    description: 'GEF: Cash Advances',
    isActive: true,
  },
];

describe('mapFacilityCategoryCode', () => {
  const baseParams = {
    ewcsSupplierType: 'Mock supplier type',
    facilityCategories: mockFacilityCategories,
    isCashFacility: false,
    isContingentFacility: false,
    isEwcsFacility: false,
  };

  describe.each([{ flag: 'isCashFacility' }, { flag: 'isContingentFacility' }])('when $flag is true', ({ flag }) => {
    describe('when a facilityType is provided', () => {
      it('should return a facility category code from the provided APIM categories', () => {
        // Arrange
        const mockFacilityCategoryCode = FACILITY_TYPE.CASH;

        // Act
        const result = mapFacilityCategoryCode({
          ...baseParams,
          facilityType: mockFacilityCategoryCode,
          [flag]: true,
        });

        // Assert
        const expected = mockFacilityCategories[2].code; // The only category with "GEF" and "Cash"

        expect(result).toEqual(expected);
      });
    });

    describe('when a facilityType is provided, but an APIM category does not match', () => {
      it('should return null', () => {
        // Arrange
        const mockFacilityCategoryCode = `NOT ${FACILITY_TYPE.CASH}`;

        // Act
        const result = mapFacilityCategoryCode({
          ...baseParams,
          facilityType: mockFacilityCategoryCode,
          [flag]: true,
        });

        // Assert
        expect(result).toBeNull();
      });
    });

    describe('when a facilityType is an empty string', () => {
      it('should return null', () => {
        // Act
        const result = mapFacilityCategoryCode({
          ...baseParams,
          facilityType: '',
          [flag]: true,
        });

        // Assert
        expect(result).toBeNull();
      });
    });

    describe('when a facilityType is NOT provided', () => {
      it('should return null', () => {
        // Act
        const result = mapFacilityCategoryCode({
          ...baseParams,
          facilityType: undefined,
          [flag]: true,
        });

        // Assert
        expect(result).toBeNull();
      });
    });
  });

  describe('when both isCashFacility and isContingentFacility are false', () => {
    it('should return null', () => {
      // Arrange
      const mockFacilityCategoryCode = 'Mock facility category code';

      // Act
      const result = mapFacilityCategoryCode({
        ...baseParams,
        facilityType: mockFacilityCategoryCode,
      });

      // Assert
      expect(result).toBeNull();
    });
  });
});
