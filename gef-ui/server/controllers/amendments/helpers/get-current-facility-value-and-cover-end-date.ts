import { getUnixTime } from 'date-fns';
import { Facility } from '../../../types/facility';
import api from '../../../services/api';

/**
 * Get the current facility value and cover end date.
 * If an amendment exists for either value or cover end date, it will return the latest values.
 * If no amendment exists, it will return the values from the facility.
 * @param facilityId - The ID of the facility.
 * @param facility - The facility object.
 * @param userToken - The user token for authentication.
 * @returns An object containing the current cover end date and current value.
 */
export const getCurrentFacilityValueAndCoverEndDate = async (facilityId: string, facility: Facility, userToken: string) => {
  try {
    const facilityCoverEndDate = facility.coverEndDate ? new Date(facility.coverEndDate) : null;
    let currentCoverEndDate = facilityCoverEndDate ? getUnixTime(facilityCoverEndDate) : null;

    let currentValue = facility.value || null;

    const { coverEndDate, value } = await api.getLatestAmendmentFacilityValueAndCoverEndDate({ facilityId, userToken });

    if (coverEndDate) {
      currentCoverEndDate = getUnixTime(new Date(coverEndDate));
    }

    if (value) {
      currentValue = Number(value);
    }

    return { currentCoverEndDate, currentValue };
  } catch (error) {
    console.error('Error getting current facility value and cover end date: %o', error);
    throw error;
  }
};
