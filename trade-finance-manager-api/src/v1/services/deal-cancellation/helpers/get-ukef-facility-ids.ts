import { TfmFacility } from '@ukef/dtfs2-common';
import { UKEF_ID } from '../../../../constants/deals';

/**
 * Maps the facilities objects into their UKEF ids
 * @param facilities Facilities
 * @returns UKEF facility Ids
 */
export const getUkefFacilityIds = (facilities: TfmFacility[]): string[] =>
  facilities
    .map((facility) => facility.facilitySnapshot.ukefFacilityId)
    .filter((id): id is string => id !== null && id !== UKEF_ID.PENDING && id !== UKEF_ID.TEST);
