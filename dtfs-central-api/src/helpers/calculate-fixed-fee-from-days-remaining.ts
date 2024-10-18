import Big from 'big.js';
import { CalculateFixedFeeFromDaysRemainingParams } from '@ukef/dtfs2-common';

/**
 * An admin fee (fixed at 10%) is applied to the fixed fee, meaning
 * we subtract this amount when calculating it
 */
export const BANK_ADMIN_FEE_ADJUSTMENT = 0.9;

/**
 * calculateFixedFeeFromDaysRemaining
 * Calculates the fixed fee for the given parameters and number of days provided
 * @param param - The parameters to calculate the fixed fee with
 * @param param.utilisation - The facility utilisation
 * @param param.numberOfDaysRemainingInCoverPeriod - The number of days remaining in the cover period
 * @param param.interestPercentage - The facility interest percentage
 * @param param.dayCountBasis - The facility day count basis
 * @returns The fixed fee for the current report period
 */
export const calculateFixedFeeFromDaysRemaining = ({
  ukefShareOfUtilisation,
  numberOfDaysRemainingInCoverPeriod,
  interestPercentage,
  dayCountBasis,
}: CalculateFixedFeeFromDaysRemainingParams): number => {
  const interestPercentageAsDecimal = new Big(interestPercentage).div(100);
  return new Big(ukefShareOfUtilisation)
    .mul(interestPercentageAsDecimal)
    .mul(BANK_ADMIN_FEE_ADJUSTMENT)
    .mul(numberOfDaysRemainingInCoverPeriod)
    .div(dayCountBasis)
    .round(2)
    .toNumber();
};
