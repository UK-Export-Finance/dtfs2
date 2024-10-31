import { Facility, FACILITY_TYPE, MAPPED_FACILITY_TYPE } from '@ukef/dtfs2-common';
import { mapFacilityType, mapGefFacilityType } from './mapFacilityType';

const { BOND, LOAN, CASH, CONTINGENT } = FACILITY_TYPE;

describe('mapFacilityType', () => {
  describe(`when the facility type is ${BOND}`, () => {
    it('should return the facility bondType', () => {
      const mockBondFacility = {
        bondType: 'Bid bond',
      };

      const result = mapFacilityType(BOND, mockBondFacility as Facility);
      expect(result).toEqual(mockBondFacility.bondType);
    });
  });

  describe(`when the facility type is ${LOAN}`, () => {
    it('should return the correct mapped facility type', () => {
      const result = mapFacilityType(LOAN, {} as Facility);

      expect(result).toEqual(MAPPED_FACILITY_TYPE.LOAN);
    });
  });

  describe(`when the facility type is unrecognised`, () => {
    it('should return null', () => {
      const result = mapFacilityType(CONTINGENT, {} as Facility);

      expect(result).toEqual(null);
    });
  });
});

describe('mapGefFacilityType', () => {
  describe(`when the facility type is ${CASH}`, () => {
    it('should return the correct mapped facility type', () => {
      const result = mapGefFacilityType(CASH);

      expect(result).toEqual(MAPPED_FACILITY_TYPE.CASH);
    });
  });

  describe(`when the facility type is ${CONTINGENT}`, () => {
    it('should return the correct mapped facility type', () => {
      const result = mapGefFacilityType(CONTINGENT);

      expect(result).toEqual(MAPPED_FACILITY_TYPE.CONTINGENT);
    });
  });

  describe(`when the facility type is unrecognised`, () => {
    it('should return null', () => {
      const result = mapGefFacilityType(BOND);

      expect(result).toEqual(null);
    });
  });
});
