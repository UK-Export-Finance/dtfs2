import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { mapEwcsFacilityCategoryCode, mapFacilityCategoryCode } from '.';
import { FACILITY_CATEGORY_CODES } from '../../../constants';

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

const facilityFlagsAllFalse = {
  isCashFacility: false,
  isContingentFacility: false,
  isEwcsFacility: false,
};

describe('mapEwcsFacilityCategoryCode', () => {
  describe('when supplierType is a recognised key', () => {
    it.each([
      { supplierType: 'Exporter', expected: FACILITY_CATEGORY_CODES.Exporter },
      { supplierType: 'UK Supplier', expected: FACILITY_CATEGORY_CODES['UK Supplier'] },
    ])('should return the matching category code for "$supplierType"', ({ supplierType, expected }) => {
      // Act
      const result = mapEwcsFacilityCategoryCode(supplierType);

      // Assert
      expect(result).toStrictEqual(expected);
    });
  });

  describe('when supplierType is not a recognised key', () => {
    it('should return the UNKNOWN category code', () => {
      // Act
      const result = mapEwcsFacilityCategoryCode('UnknownType');

      // Assert
      const expected = FACILITY_CATEGORY_CODES.UNKNOWN;

      expect(result).toStrictEqual(expected);
    });
  });

  describe('when supplierType is null', () => {
    it('should return the UNKNOWN category code', () => {
      // Act
      const result = mapEwcsFacilityCategoryCode(null);

      // Assert
      const expected = FACILITY_CATEGORY_CODES.UNKNOWN;

      expect(result).toStrictEqual(expected);
    });
  });
});

describe('mapFacilityCategoryCode', () => {
  describe('when isCashFacility is true', () => {
    describe('when a matching APIM category exists', () => {
      it('should return the matching facility category code', () => {
        // Arrange & Act
        const result = mapFacilityCategoryCode({
          ...facilityFlagsAllFalse,
          isCashFacility: true,
          ewcsSupplierType: null,
          facilityType: FACILITY_TYPE.CASH,
          facilityCategories: mockFacilityCategories,
        });

        // Assert
        expect(result).toStrictEqual(mockFacilityCategories[2].code); // the only category with "GEF" and "Cash"
      });
    });

    describe('when no APIM category matches the facilityType', () => {
      it('should return null', () => {
        // Arrange & Act
        const result = mapFacilityCategoryCode({
          ...facilityFlagsAllFalse,
          isCashFacility: true,
          ewcsSupplierType: null,
          facilityType: `NOT ${FACILITY_TYPE.CASH}`,
          facilityCategories: mockFacilityCategories,
        });

        // Assert
        expect(result).toBeNull();
      });
    });

    describe('when facilityType is an empty string', () => {
      it('should return null', () => {
        // Arrange & Act
        const result = mapFacilityCategoryCode({
          ...facilityFlagsAllFalse,
          isCashFacility: true,
          ewcsSupplierType: null,
          facilityType: '',
          facilityCategories: mockFacilityCategories,
        });

        // Assert
        expect(result).toBeNull();
      });
    });

    describe('when facilityType is undefined', () => {
      it('should return null', () => {
        // Arrange & Act
        const result = mapFacilityCategoryCode({
          ...facilityFlagsAllFalse,
          isCashFacility: true,
          ewcsSupplierType: null,
          facilityType: undefined,
          facilityCategories: mockFacilityCategories,
        });

        // Assert
        expect(result).toBeNull();
      });
    });
  });

  describe('when isContingentFacility is true', () => {
    describe('when a matching APIM category exists', () => {
      it('should return the matching facility category code', () => {
        // Arrange & Act
        const result = mapFacilityCategoryCode({
          ...facilityFlagsAllFalse,
          isContingentFacility: true,
          ewcsSupplierType: null,
          facilityType: FACILITY_TYPE.CONTINGENT,
          facilityCategories: mockFacilityCategories,
        });

        // Assert
        const expected = mockFacilityCategories[1].code; // the only category with "GEF" and "Contingent"

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('when isEwcsFacility is true', () => {
    it('should return the EWCS facility category code for a recognised supplierType', () => {
      // Arrange & Act
      const result = mapFacilityCategoryCode({
        ...facilityFlagsAllFalse,
        isEwcsFacility: true,
        ewcsSupplierType: 'Exporter',
        facilityCategories: mockFacilityCategories,
      });

      // Assert
      expect(result).toStrictEqual(FACILITY_CATEGORY_CODES.Exporter);
    });

    it('should return the UNKNOWN category code when supplierType is null', () => {
      // Arrange & Act
      const result = mapFacilityCategoryCode({
        ...facilityFlagsAllFalse,
        isEwcsFacility: true,
        ewcsSupplierType: null,
        facilityCategories: mockFacilityCategories,
      });

      // Assert
      expect(result).toStrictEqual(FACILITY_CATEGORY_CODES.UNKNOWN);
    });
  });

  describe('when all facility flags are false', () => {
    it('should return null', () => {
      // Arrange & Act
      const result = mapFacilityCategoryCode({
        ...facilityFlagsAllFalse,
        ewcsSupplierType: null,
        facilityType: FACILITY_TYPE.CASH,
        facilityCategories: mockFacilityCategories,
      });

      // Assert
      expect(result).toBeNull();
    });
  });
});
