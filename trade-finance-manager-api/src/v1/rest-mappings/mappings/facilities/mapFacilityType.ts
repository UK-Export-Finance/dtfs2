import { Facility, FacilityType, FACILITY_TYPE, MAPPED_FACILITY_TYPE, GefFacilityType, MappedGefFacilityType } from '@ukef/dtfs2-common';

const { BOND, LOAN, CASH, CONTINGENT } = FACILITY_TYPE;

/**
 * Maps a BSS/EWCS facility type to a differently worded facility type, to ultimately be rendered in the UI, as per design.
 * @param type - the facility type in the database
 * @param facilitySnapshot - the facility snapshot from the database
 * @returns the mapped facility type
 *
 * @example
 * // returns 'Bid Bond'
 * mapFacilityType('Bond', {...facilitySnapshot, code: 'BSS', bondType: 'Bid Bond'})
 *
 * @example
 * // returns 'Loan'
 * mapFacilityType('Loan', facilitySnapshot)
 */
export const mapBssEwcsFacilityType = (type: FacilityType, facilitySnapshot: Facility): string | null => {
  if (type === BOND) {
    return typeof facilitySnapshot.bondType === 'string' ? facilitySnapshot.bondType : null;
  }

  if (type === LOAN) {
    return MAPPED_FACILITY_TYPE.LOAN;
  }

  return null;
};

/**
 * Maps a GEF facility type to a differently worded facility type, to ultimately be rendered in the UI, as per design.
 * @param type - the facility type in the database
 * @returns the mapped facility type
 *
 * @example
 * // returns 'Cash Facility'
 * mapGefFacilityType('Cash')
 *
 * @example
 * // returns 'Contingent Facility'
 * mapGefFacilityType('Contingent')
 */
export const mapGefFacilityType = (type: GefFacilityType): MappedGefFacilityType | null => {
  if (type === CASH) {
    return MAPPED_FACILITY_TYPE.CASH;
  }

  if (type === CONTINGENT) {
    return MAPPED_FACILITY_TYPE.CONTINGENT;
  }

  return null;
};
