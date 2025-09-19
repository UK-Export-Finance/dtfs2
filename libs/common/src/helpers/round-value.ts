import { decimalsCount } from './ui/decimals-count';
import { roundNumber } from './round-number';

/**
 * rounds a value in GBP to 2 decimal places if it has more than 2 decimal places
 * if it has 2 or fewer decimal places, it returns the value as is
 * @param valueInGBP value in GBP to round
 * @returns rounded value
 */
export const roundValue = (valueInGBP: number) => {
  const totalDecimals = decimalsCount(valueInGBP);

  // rounds to 2 decimal palaces if decimals greater than 2
  return totalDecimals > 2 ? roundNumber(valueInGBP, 2) : valueInGBP;
};
