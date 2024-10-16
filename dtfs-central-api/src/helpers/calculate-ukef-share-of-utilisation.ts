import Big from 'big.js';

/**
 * calculates the ukef share of the utilisation
 * @param utilisation - provided utilisation value
 * @param coverPercentage - facility cover percentage
 * @returns returns calculated ukef share of utilisation
 */
export const calculateUkefShareOfUtilisation = (utilisation: number, coverPercentage: number): number => {
  const coverPercentageAsDecimal = new Big(coverPercentage).div(100);

  return new Big(utilisation).mul(coverPercentageAsDecimal).round(2).toNumber();
};
