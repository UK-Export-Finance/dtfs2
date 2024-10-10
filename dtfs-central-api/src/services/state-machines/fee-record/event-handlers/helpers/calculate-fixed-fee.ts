import { differenceInDays, isBefore, startOfMonth } from 'date-fns';
import { getDateFromMonthAndYear, MonthAndYear, CalculateFixedFeeParams } from '@ukef/dtfs2-common';
import { calculateFixedFeeFromDaysRemaining } from '../../../../../helpers/calculate-fixed-fee-from-days-remaining';

const getNumberOfDaysRemainingInCoverPeriod = (reportPeriodStart: MonthAndYear, coverStartDate: Date, coverEndDate: Date): number => {
  const currentReportPeriodStartMonthStart = startOfMonth(getDateFromMonthAndYear(reportPeriodStart));

  if (isBefore(currentReportPeriodStartMonthStart, coverStartDate)) {
    return differenceInDays(coverEndDate, coverStartDate);
  }
  return differenceInDays(coverEndDate, currentReportPeriodStartMonthStart);
};

/**
 * Calculates the fixed fee for the given parameters
 * @param param - The parameters to calculate the fixed fee with
 * @param param.utilisation - The facility utilisation
 * @param param.reportPeriod - The report period
 * @param param.coverStartDate - The facility cover start date
 * @param param.coverEndDate - The facility cover end date
 * @param param.interestPercentage - The facility interest percentage
 * @param param.dayCountBasis - The facility day count basis
 * @returns The fixed fee for the current report period
 */
export const calculateFixedFee = ({
  utilisation,
  reportPeriod,
  coverStartDate,
  coverEndDate,
  interestPercentage,
  dayCountBasis,
}: CalculateFixedFeeParams): number => {
  const numberOfDaysRemainingInCoverPeriod = getNumberOfDaysRemainingInCoverPeriod(reportPeriod.start, coverStartDate, coverEndDate);

  return calculateFixedFeeFromDaysRemaining({ utilisation, numberOfDaysRemainingInCoverPeriod, interestPercentage, dayCountBasis });
};
