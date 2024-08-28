import { isTfmFacilityEndDateFeatureFlagEnabled, FACILITY_TYPE } from '@ukef/dtfs2-common';

/**
 * Facilities are part of a GEF deal if and only if they have a cash or contingent facility type.
 * In mapGefFacility.js, the received facility gets mapped from 'CASH' or 'CONTINGENT' to 'Cash facility' and 'Contingent facility'
 */
const isFacilityPartOfGefDeal = (type) => {
  return type === FACILITY_TYPE.CASH || type === FACILITY_TYPE.CONTINGENT;
};

export const isFacilityEndDateEnabledForFacility = (facility) => {
  return isTfmFacilityEndDateFeatureFlagEnabled() && isFacilityPartOfGefDeal(facility.facilitySnapshot.type);
};
