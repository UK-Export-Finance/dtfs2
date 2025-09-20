import { decimalsCount } from './ui/decimals-count';
import { roundNumber } from './round-number';

/**
 * calculates UKEF exposure based on facility value in GBP and cover percentage
 * @param facilityValueInGBP
 * @param coverPercentage
 * @returns ukef exposure as a number or null if no value can be calculated
 */
export const calculateUkefExposure = (facilityValueInGBP?: number, coverPercentage?: number): number | null => {
  if (facilityValueInGBP && coverPercentage) {
    const calculation = facilityValueInGBP * (coverPercentage / 100);

    const totalDecimals = decimalsCount(calculation);

    const ukefExposure = totalDecimals > 2 ? roundNumber(calculation, 2) : calculation;

    return ukefExposure;
  }

  return null;
};
