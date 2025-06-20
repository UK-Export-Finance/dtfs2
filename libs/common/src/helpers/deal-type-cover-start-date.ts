import { Facility } from '../types';

/**
 * calculates the cover start date for a facility based on deal type
 * If the cover start date exists, it returns that date as is GEF
 * If the cover start date does not exist, it constructs a date from the requested cover start date fields.
 * If the requested cover start date is provided as a timestamp, it converts it to a Date
 * @param facilitySnapshot
 * @returns cover start date
 */
export const dealTypeCoverStartDate = (facilitySnapshot: Facility): Date | string | undefined => {
  const { coverStartDate } = facilitySnapshot;

  // if exists - GEF
  if (coverStartDate) {
    return coverStartDate;
  }

  let dateConstructed;

  if (
    facilitySnapshot['requestedCoverStartDate-year'] &&
    facilitySnapshot['requestedCoverStartDate-month'] &&
    facilitySnapshot['requestedCoverStartDate-day']
  ) {
    // BSS stored as separate year month day values
    dateConstructed = new Date(
      facilitySnapshot['requestedCoverStartDate-year'],
      facilitySnapshot['requestedCoverStartDate-month'] - 1,
      facilitySnapshot['requestedCoverStartDate-day'],
    );
  }

  if (facilitySnapshot.requestedCoverStartDate) {
    dateConstructed = new Date(parseInt(facilitySnapshot.requestedCoverStartDate, 10));
  }

  return dateConstructed;
};
