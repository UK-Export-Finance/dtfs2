import { isTfmFacilityEndDateFeatureFlagEnabled, MAPPED_FACILITY_TYPE } from '@ukef/dtfs2-common';

/**
 * @description Facilities are part of a GEF deal if and only if they have a cash or contingent facility type.
 * In mapGefFacility.js, the received facility gets mapped from 'CASH' or 'CONTINGENT' to 'Cash facility' and 'Contingent facility'
 * @param {string} facilityType - the facility type of the mapped facility. Note this is different from the facility type in an unmapped facility#
 * @returns {boolean} - whether the facility is part of a GEF deal
 */
export const isFacilityPartOfGefDeal = (facilityType) => {
  return facilityType === MAPPED_FACILITY_TYPE.CASH || facilityType === MAPPED_FACILITY_TYPE.CONTINGENT;
};

export const isFacilityEndDateEnabledForFacility = (facility) => {
  return isTfmFacilityEndDateFeatureFlagEnabled() && isFacilityPartOfGefDeal(facility.facilitySnapshot.type);
};
