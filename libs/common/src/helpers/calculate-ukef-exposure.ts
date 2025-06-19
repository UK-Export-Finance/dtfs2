import { decimalsCount } from './decimals-count';
import { roundNumber } from './round-number';

/**
 * calculates UKEF exposure based on facility value in GBP and cover percentage
 * @param facilityValueInGBP
 * @param coverPercentage
 * @returns ukef exposure as a number or null if no value can be calculated
 */
export const calculateUkefExposure = (facilityValueInGBP?: string, coverPercentage?: number) => {
  if (facilityValueInGBP && coverPercentage) {
    // parse float as can have 2 decimal places in facility value
    const calculation = parseFloat(facilityValueInGBP) * (coverPercentage / 100);

    const totalDecimals = decimalsCount(calculation);

    const ukefExposure = totalDecimals > 2 ? roundNumber(calculation, 2) : calculation;

    return ukefExposure;
  }

  return null;
};
