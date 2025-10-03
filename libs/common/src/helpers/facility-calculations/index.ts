import dotenv from 'dotenv';

import { GEF_FACILITY_TYPE, FACILITY_UTILISATION_PERCENTAGE } from '../../constants';
import { UnixTimestampString, Facility, FacilityType } from '../../types';

dotenv.config();

const { CASH, CONTINGENT } = GEF_FACILITY_TYPE;
const { CASH_UTILISATION_PERCENTAGE, CONTINGENT_UTILISATION_PERCENTAGE } = process.env;

/**
 * Calculates the fixed utilisation percentage for a given facility type.
 *
 * The function checks if a custom utilisation percentage is defined for the facility type.
 * If so, it returns the custom value; otherwise, it falls back to the default percentage
 * defined in `FACILITY_UTILISATION_PERCENTAGE`.
 *
 * @param type - The type of facility for which to calculate the utilisation percentage.
 * @returns The fixed utilisation percentage as a number.
 */
export const calculateFixedPercentage = (type: FacilityType): number => {
  switch (type) {
    case CASH:
      return CASH_UTILISATION_PERCENTAGE ? Number(CASH_UTILISATION_PERCENTAGE) : FACILITY_UTILISATION_PERCENTAGE.CASH;
    case CONTINGENT:
      return CONTINGENT_UTILISATION_PERCENTAGE ? Number(CONTINGENT_UTILISATION_PERCENTAGE) : FACILITY_UTILISATION_PERCENTAGE.CONTINGENT;
    default:
      return FACILITY_UTILISATION_PERCENTAGE.DEFAULT;
  }
};

/**
 * Calculates the initial utilisation of a facility based on its value and type.
 *
 * @param facilityValue - The monetary value of the facility.
 * @param type - The type of the facility, used to determine the fixed percentage.
 * @returns The initial utilisation amount, calculated as facilityValue multiplied by a fixed percentage for the given type.
 */
export const calculateInitialUtilisation = (facilityValue: number, type: FacilityType): number => facilityValue * calculateFixedPercentage(type);

/**
 * Calculates the drawn amount for a facility based on its value, cover percentage, and type.
 *
 * @param facilityValue - The total value of the facility.
 * @param coverPercentage - The percentage of the facility value that is covered.
 * @param type - The type of the facility.
 * @returns The calculated drawn amount.
 */
export const calculateDrawnAmount = (facilityValue: number, coverPercentage: number, type: FacilityType): number =>
  calculateInitialUtilisation(facilityValue, type) * (coverPercentage / 100);

/**
 * Calculates the number of days of cover between two dates.
 *
 * Accepts dates as either Unix timestamp strings, Date objects, or null.
 * Converts the input dates to milliseconds and computes the difference in days.
 * If the facility type is `Contingent` then an additional day is added to the difference.
 *
 * @param coverStartDate - The start date of the cover, as a Unix timestamp string, Date object, or null.
 * @param coverEndDate - The end date of the cover, as a Unix timestamp string, Date object, or null.
 * @param type - The type of the facility.
 * @returns The number of days between the start and end dates.
 */
export const calculateDaysOfCover = (
  type: FacilityType,
  coverStartDate: UnixTimestampString | Date | null,
  coverEndDate: UnixTimestampString | Date | null,
): number => {
  const startDate = coverStartDate?.toString()?.includes('T') ? new Date(String(coverStartDate)).valueOf() : Number(coverStartDate);
  const endDate = coverEndDate?.toString()?.includes('T') ? new Date(String(coverEndDate)).valueOf() : Number(coverEndDate);

  /**
   * Get EPOCH difference by diving with `86,400,000 ms`.
   * Above is derived from 1000 ms * 60 seconds * 60 minutes * 24 hours
   */
  const differenceMs = endDate - startDate;
  const difference = differenceMs >= 86400000 ? Math.round(differenceMs / 86400000) : differenceMs;

  return type === CONTINGENT ? difference + 1 : difference;
};

/**
 * Calculates the fee amount for a facility based on the drawn amount, duration of cover, day count basis, and guarantee fee percentage.
 *
 * @param drawnAmount - The amount that has been drawn from the facility.
 * @param daysOfCover - The number of days the cover is provided for.
 * @param dayCountBasis - The basis for day count calculation (e.g., 360 or 365).
 * @param guaranteeFee - The guarantee fee percentage to be applied.
 * @returns The calculated fee amount.
 */
export const calculateFeeAmount = (drawnAmount: number, daysOfCover: number, dayCountBasis: number, guaranteeFee: number): number =>
  (drawnAmount * daysOfCover * (guaranteeFee / 100)) / dayCountBasis;

/**
 * Calculates the GEF facility fee record for a given facility.
 *
 * If the facility has been issued, this function extracts relevant properties from the facility,
 * calculates the drawn amount, the number of days of cover, and the fee amount, then returns the fee record.
 * If the facility has not been issued, it returns `null`.
 *
 * @param facility - The facility object containing details required for fee calculation.
 * @returns The calculated fee record if the facility has been issued; otherwise, `null`.
 */
export const calculateGefFacilityFeeRecord = (facility: Facility) => {
  if (facility.hasBeenIssued) {
    const { guaranteeFee, dayCountBasis, value, coverPercentage, coverStartDate, coverEndDate, type } = facility;

    const drawnAmount = calculateDrawnAmount(value, coverPercentage, type);
    const daysOfCover = calculateDaysOfCover(type, coverStartDate, coverEndDate);
    const feeRecord = calculateFeeAmount(drawnAmount, daysOfCover, dayCountBasis, guaranteeFee);

    return feeRecord;
  }

  return null;
};
