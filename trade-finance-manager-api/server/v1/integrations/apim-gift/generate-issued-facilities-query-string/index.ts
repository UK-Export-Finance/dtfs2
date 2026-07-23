import { TfmFacility } from '@ukef/dtfs2-common';

/**
 * Generates a query string of facility IDs.
 * @param {TfmFacility[]} issuedFacilities - TFM facilities.
 * @returns {string} A comma-separated string of facility IDs.
 */
export const generateIssuedFacilitiesQueryString = (issuedFacilities: TfmFacility[]): string =>
  issuedFacilities.map((facility) => facility.facilitySnapshot.ukefFacilityId).join(',');
