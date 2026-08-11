import { FACILITY_TYPE, FacilityType } from '@ukef/dtfs2-common';

type GetFacilityTypeFlagsReturnShape = {
  isBssFacility: boolean;
  isCashFacility: boolean;
  isContingentFacility: boolean;
  isEwcsFacility: boolean;
};

/**
 * Return an object with BSS/EWCS/GEF facility flags.
 * Avoids doing the same checks in other functions.
 * @param {FacilityType} facilityType - The facility type
 * @returns {GetFacilityTypeFlagsReturnShape} BSS/EWCS/GEF facility booleans
 */
export const getFacilityTypeFlags = (facilityType: FacilityType): GetFacilityTypeFlagsReturnShape => ({
  isBssFacility: facilityType === FACILITY_TYPE.BOND,
  isCashFacility: facilityType === FACILITY_TYPE.CASH,
  isContingentFacility: facilityType === FACILITY_TYPE.CONTINGENT,
  isEwcsFacility: facilityType === FACILITY_TYPE.LOAN,
});
