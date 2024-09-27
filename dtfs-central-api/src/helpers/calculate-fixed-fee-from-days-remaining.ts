import Big from 'big.js';
import { CalculateFixedFeeFromDaysRemainingParams } from '@ukef/dtfs2-common';

/**
 * An admin fee (fixed at 10%) is applied to the fixed fee, meaning
 * we subtract this amount when calculating it
 */
const BANK_ADMIN_FEE_ADJUSTMENT = 0.9;

/**
 * calculateFixedFeeFromDaysRemaining
 * Calculates the fixed fee for the given parameters and number of days provided
 * @param param - The parameters to calculate the fixed fee with
 * @param {Number} param.utilisation - The facility utilisation
 * @param {Number} param.numberOfDaysRemainingInCoverPeriod - The number of days remaining in the cover period
 * @param {Number} param.interestPercentage - The facility interest percentage
 * @param {Number} param.dayCountBasis - The facility day count basis
 * @returns {Number} The fixed fee for the current report period
 */
export const calculateFixedFeeFromDaysRemaining = ({
  utilisation,
  numberOfDaysRemainingInCoverPeriod,
  interestPercentage,
  dayCountBasis,
}: CalculateFixedFeeFromDaysRemainingParams): number => {
  const interestPercentageAsDecimal = new Big(interestPercentage).div(100);
  return new Big(utilisation)
    .mul(interestPercentageAsDecimal)
    .mul(BANK_ADMIN_FEE_ADJUSTMENT)
    .mul(numberOfDaysRemainingInCoverPeriod)
    .div(dayCountBasis)
    .round(2)
    .toNumber();
};
