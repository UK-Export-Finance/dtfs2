import { format, fromUnixTime } from 'date-fns';
import { Facility } from '../types';
import { dealTypeCoverStartDate } from './deal-type-cover-start-date';
import { convertUnixTimestampWithoutMilliseconds } from './date';

/**
 * formats cover start and end dates for a facility in the correct format
 * Also returns the facility type.
 * Used for external API calls to get tenor.
 * If the facility type, cover start date, or cover end date is not defined, it returns an empty object.
 * @param facilitySnapshot
 * @param coverEndDate
 * @returns object with formatted dates and facility type or empty object if no value can be calculated
 */
export const formatDatesForTenor = (facilitySnapshot: Facility, coverEndDate?: number) => {
  const validConditions =
    (facilitySnapshot?.ukefFacilityType || facilitySnapshot?.type) &&
    (facilitySnapshot?.coverStartDate || facilitySnapshot?.requestedCoverStartDate) &&
    coverEndDate;

  if (validConditions) {
    const { ukefFacilityType, type } = facilitySnapshot;
    const facilityType = ukefFacilityType || type;
    const formattedCoverEndDate = convertUnixTimestampWithoutMilliseconds(coverEndDate);

    const coverStartDate = dealTypeCoverStartDate(facilitySnapshot);

    if (!coverStartDate) {
      console.error('Cover start date is not defined for facility', facilitySnapshot._id);
      return {};
    }

    // formatting for external api call
    const coverStartDateFormatted = format(new Date(coverStartDate), 'yyyy-MM-dd');

    const coverEndDateFormatted = format(fromUnixTime(formattedCoverEndDate), 'yyyy-MM-dd');

    return {
      facilityType,
      coverStartDateFormatted,
      coverEndDateFormatted,
    };
  }

  return {};
};
