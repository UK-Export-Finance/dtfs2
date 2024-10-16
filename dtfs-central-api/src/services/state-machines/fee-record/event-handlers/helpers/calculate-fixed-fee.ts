import { differenceInDays, startOfDay, endOfMonth, addDays } from 'date-fns';
import { getDateFromMonthAndYear, MonthAndYear, CalculateFixedFeeParams } from '@ukef/dtfs2-common';
import { calculateFixedFeeFromDaysRemaining } from '../../../../../helpers/calculate-fixed-fee-from-days-remaining';

/**
 * Gets the number of days remaining in cover period by calculating difference
 * between the day after the end of the report period and the cover end date
 * @param reportPeriodEnd - The report period end
 * @param coverEndDate - The cover end date of the facility
 * @returns The number of days remaining in the cover period
 */
const getNumberOfDaysRemainingInCoverPeriod = (reportPeriodEnd: MonthAndYear, coverEndDate: Date): number => {
  const startDateOfReportPeriodEndMonth = getDateFromMonthAndYear(reportPeriodEnd);
  const endDateOfReportPeriod = startOfDay(endOfMonth(startDateOfReportPeriodEndMonth));
  const startDateOfNextReportPeriod = addDays(endDateOfReportPeriod, 1);

  return differenceInDays(coverEndDate, startDateOfNextReportPeriod);
};

/**
 * Calculates the fixed fee for the given parameters
 * @param param - The parameters to calculate the fixed fee with
 * @param param.utilisation - The facility utilisation
 * @param param.reportPeriod - The report period
 * @param param.coverEndDate - The facility cover end date
 * @param param.interestPercentage - The facility interest percentage
 * @param param.dayCountBasis - The facility day count basis
 * @returns The fixed fee for the current report period
 */
export const calculateFixedFee = ({ utilisation, reportPeriod, coverEndDate, interestPercentage, dayCountBasis }: CalculateFixedFeeParams): number => {
  const numberOfDaysRemainingInCoverPeriod = getNumberOfDaysRemainingInCoverPeriod(reportPeriod.end, coverEndDate);

  return calculateFixedFeeFromDaysRemaining({ utilisation, numberOfDaysRemainingInCoverPeriod, interestPercentage, dayCountBasis });
};
