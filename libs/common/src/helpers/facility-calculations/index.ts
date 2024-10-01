/**
 * calculateInitialUtilisation
 * calculates initial utilisation for a facility (10% of the facility value)
 * @param facilityValue
 * @returns initial utilisation value
 */
export const calculateInitialUtilisation = (facilityValue: number): number => facilityValue * 0.1;

/**
 * calculateDrawnAmount
 * Business logic:
 * (Facility Amount * UKEF Cover (fractional percentage)) * 10%
 * @param {Number} facilityValue
 * @param {Number} coverPercentage
 * @returns {Number} calculated drawn amount
 */
export const calculateDrawnAmount = (facilityValue: number, coverPercentage: number): number =>
  calculateInitialUtilisation(facilityValue) * (coverPercentage / 100);
