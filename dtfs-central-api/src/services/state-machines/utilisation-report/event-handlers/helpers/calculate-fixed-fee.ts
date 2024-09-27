import { differenceInDays } from 'date-fns';
import { CalculateFixedFeeUtilisationReportParams } from '@ukef/dtfs2-common';
import { calculateFixedFeeFromDaysRemaining } from '../../../../../helpers/calculate-fixed-fee-from-days-remaining';

/**
 * getNumberOfDaysInCoverPeriod
 * calculates number of days in the cover period between the cover start and end dates
 * @param {Date} coverStartDate
 * @param {Date} coverEndDate
 * @returns {Number} number of days in the cover period
 */
export const getNumberOfDaysInCoverPeriod = (coverStartDate: Date, coverEndDate: Date): number => differenceInDays(coverEndDate, coverStartDate);

/**
 * calculateFixedFee
 * Calculates the fixed fee for the utilisation report
 * gets the number of days in the cover period
 * calculates and returns the fixed free from calculateFixedFeeFromDaysRemaining
 * @param {Number} utilisation - The facility utilisation
 * @param {Date} coverStartDate - The facility cover start date
 * @param {Date} coverEndDate - The facility cover end date
 * @param {Number} interestPercentage - The facility interest percentage
 * @param {Number} dayCountBasis - The facility day count basis
 * @returns The fixed fee for the current report period
 */
export const calculateFixedFee = ({
  utilisation,
  coverStartDate,
  coverEndDate,
  interestPercentage,
  dayCountBasis,
}: CalculateFixedFeeUtilisationReportParams): number => {
  const numberOfDaysRemainingInCoverPeriod = getNumberOfDaysInCoverPeriod(coverStartDate, coverEndDate);

  return calculateFixedFeeFromDaysRemaining({ utilisation, numberOfDaysRemainingInCoverPeriod, interestPercentage, dayCountBasis });
};
