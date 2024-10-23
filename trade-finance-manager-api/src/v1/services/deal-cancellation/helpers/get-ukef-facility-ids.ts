import { TfmFacility } from '@ukef/dtfs2-common';

/**
 * Maps the facilities objects into their UKEF ids
 * @param facilities Facilities
 * @returns UKEF facility Ids
 */
export const getUkefFacilityIds = (facilities: TfmFacility[]): string[] =>
  facilities.map((facility) => facility.facilitySnapshot.ukefFacilityId).filter((id): id is string => id !== null);
