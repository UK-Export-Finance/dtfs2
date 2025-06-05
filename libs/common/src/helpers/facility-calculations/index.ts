import dotenv from 'dotenv';
import { GEF_FACILITY_TYPE, FACILITY_UTILISATION_PERCENTAGE } from '../../constants';
import { GefFacilityType } from '../../types';

dotenv.config();

const { CASH, CONTINGENT } = GEF_FACILITY_TYPE;
const { CASH_UTILISATION_PERCENTAGE, CONTINGENT_UTILISATION_PERCENTAGE } = process.env;

/**
 * Calculates the fixed utilisation percentage based on the GEF facility type.
 *
 * @param type - The type of facility (e.g., 'CASH', 'CONTINGENT').
 * @returns The fixed utilisation percentage for the specified facility type.
 */
export const calculateFixedPercentage = (type: GefFacilityType): number => {
  switch (type) {
    case CASH:
      return Number(CASH_UTILISATION_PERCENTAGE) ?? FACILITY_UTILISATION_PERCENTAGE.CASH;
    case CONTINGENT:
      return Number(CONTINGENT_UTILISATION_PERCENTAGE) ?? FACILITY_UTILISATION_PERCENTAGE.CONTINGENT;
    default:
      return FACILITY_UTILISATION_PERCENTAGE.DEFAULT;
  }
};

/**
 * Calculates the initial utilisation amount for a GEF facility based on its value and type.
 *
 * @param facilityValue - The monetary value of the facility.
 * @param type - The type of the facility, used to determine the fixed percentage.
 * @returns The calculated initial utilisation as a number.
 */
export const calculateInitialUtilisation = (facilityValue: number, type: GefFacilityType): number => facilityValue * calculateFixedPercentage(type);

/**
 * Calculates the drawn amount for a GEF facility based on its value, cover percentage, and type.
 *
 * @param facilityValue - The total value of the facility.
 * @param coverPercentage - The percentage of the facility value that is covered.
 * @param type - The type of the facility (of type `GefFacilityType`).
 * @returns The calculated drawn amount as a number.
 */
export const calculateDrawnAmount = (facilityValue: number, coverPercentage: number, type: GefFacilityType): number =>
  calculateInitialUtilisation(facilityValue, type) * (coverPercentage / 100);
