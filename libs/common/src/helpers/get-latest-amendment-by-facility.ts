import { PortalFacilityAmendment } from '../types';

/**
 * Returns the latest amendment for each facilityId based on updatedAt.
 * @param amendments Array of amendments
 * @returns Map of facilityId to latest amendment
 */
export function getLatestAmendmentsByFacility(amendments: PortalFacilityAmendment[]): Record<string, PortalFacilityAmendment> {
  const latest: Record<string, PortalFacilityAmendment> = {};

  for (const amendment of amendments) {
    const current = latest[amendment.facilityId.toString()];

    if (!current || amendment.updatedAt > current.updatedAt) {
      latest[amendment.facilityId.toString()] = amendment;
    }
  }

  return latest;
}
