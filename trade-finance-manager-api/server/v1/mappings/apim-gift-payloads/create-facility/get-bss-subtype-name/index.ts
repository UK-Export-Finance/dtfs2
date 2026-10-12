import { TfmFacilitySnapshot } from '@ukef/dtfs2-common';

type GetBssSubTypeNameParams = {
  facilitySnapshot: TfmFacilitySnapshot;
  isBssFacility: boolean;
};

/**
 * Get the BSS subtype name from a facility snapshot.
 *
 * @param {TfmFacilitySnapshot} params.facilitySnapshot - The facility snapshot from which to extract the BSS subtype name.
 * @param {boolean} params.isBssFacility - Whether the facility is a BSS facility.
 * @returns The BSS subtype name as a string, or undefined if not applicable.
 */
export const getBssSubtypeName = ({ facilitySnapshot, isBssFacility }: GetBssSubTypeNameParams) =>
  isBssFacility ? String(facilitySnapshot.bondType) : undefined;
