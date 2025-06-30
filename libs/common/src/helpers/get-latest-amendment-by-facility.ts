import { PortalFacilityAmendment } from '../types';

/**
 * Returns the latest amendment for each facilityId based on updatedAt.
 * @param amendments Array of amendments
 * @returns Map of facilityId to latest amendment
 */
export const getLatestAmendmentsByFacility = (amendments: PortalFacilityAmendment[]): Record<string, PortalFacilityAmendment> => {
  return amendments.reduce<Record<string, PortalFacilityAmendment>>((latest, amendment) => {
    const amendmentFacilityId = amendment.facilityId.toString();

    const current = latest[amendmentFacilityId];

    if (!current || amendment.updatedAt > current.updatedAt) {
      return { ...latest, [amendmentFacilityId]: amendment };
    }

    return latest;
  }, {});
};
