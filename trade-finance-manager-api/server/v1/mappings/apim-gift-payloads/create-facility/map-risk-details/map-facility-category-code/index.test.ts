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
  describe('when isGefDeal is true', () => {
    describe('when a facilityType is provided', () => {
      it('should return a facility category code from the provided APIM categories', () => {
        // Arrange
        const mockFacilityCategoryCode = FACILITY_TYPE.CASH;

        // Act
        const result = mapFacilityCategoryCode({
          facilityType: mockFacilityCategoryCode,
          facilityCategories: mockFacilityCategories,
          isGefDeal: true,
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
          facilityType: mockFacilityCategoryCode,
          facilityCategories: mockFacilityCategories,
          isGefDeal: true,
        });

        // Assert
        expect(result).toBeNull();
      });
    });

    describe('when a facilityType is an empty string', () => {
      it('should return null', () => {
        // Act
        const result = mapFacilityCategoryCode({
          facilityType: '',
          facilityCategories: mockFacilityCategories,
          isGefDeal: true,
        });

        // Assert
        expect(result).toBeNull();
      });
    });

    describe('when a facilityType is NOT provided', () => {
      it('should return null', () => {
        // Act
        const result = mapFacilityCategoryCode({
          facilityType: undefined,
          facilityCategories: mockFacilityCategories,
          isGefDeal: true,
        });

        // Assert
        expect(result).toBeNull();
      });
    });
  });

  describe('when isGefDeal is false', () => {
    it('should return null', () => {
      // Arrange
      const mockFacilityCategoryCode = 'Mock facility category code';

      // Act
      const result = mapFacilityCategoryCode({
        facilityType: mockFacilityCategoryCode,
        facilityCategories: mockFacilityCategories,
        isGefDeal: false,
      });

      // Assert
      expect(result).toBeNull();
    });
  });
});
