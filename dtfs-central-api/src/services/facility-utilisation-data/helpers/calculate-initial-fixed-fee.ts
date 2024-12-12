import { differenceInDays } from 'date-fns';
import { CalculateFixedFeeUtilisationReportParams } from '@ukef/dtfs2-common';
import { calculateFixedFeeFromDaysRemaining } from '../../../helpers/calculate-fixed-fee-from-days-remaining';

/**
 * getNumberOfDaysInCoverPeriod
 * calculates number of days in the cover period between the cover start and end dates
 * @param coverStartDate
 * @param coverEndDate
 * @returns number of days in the cover period
 */
export const getNumberOfDaysInCoverPeriod = (coverStartDate: Date, coverEndDate: Date): number => differenceInDays(coverEndDate, coverStartDate);

/**
 * This is currently unused because fixed fee calculations are currently turned off.
 *
 * TODO FN-3639: Remove this function if unused with new calculation requirements.
 *
 * calculateFixedFee
 * Calculates the fixed fee for the utilisation report
 * gets the number of days in the cover period
 * calculates and returns the fixed free from calculateFixedFeeFromDaysRemaining
 * @param utilisation - The facility utilisation
 * @param coverStartDate - The facility cover start date
 * @param coverEndDate - The facility cover end date
 * @param interestPercentage - The facility interest percentage
 * @param dayCountBasis - The facility day count basis
 * @returns The fixed fee for the current report period
 */
export const calculateInitialFixedFee = ({
  ukefShareOfUtilisation,
  coverStartDate,
  coverEndDate,
  interestPercentage,
  dayCountBasis,
}: CalculateFixedFeeUtilisationReportParams): number => {
  const numberOfDaysRemainingInCoverPeriod = getNumberOfDaysInCoverPeriod(coverStartDate, coverEndDate);

  return calculateFixedFeeFromDaysRemaining({ ukefShareOfUtilisation, numberOfDaysRemainingInCoverPeriod, interestPercentage, dayCountBasis });
};
