import Big from 'big.js';
import { differenceInDays, endOfMonth, addDays, startOfDay } from 'date-fns';
import { getDateFromMonthAndYear, MonthAndYear, ReportPeriod } from '@ukef/dtfs2-common';

/**
 * An admin fee (fixed at 10%) is applied to the fixed fee, meaning
 * we subtract this amount when calculating it
 */
const BANK_ADMIN_FEE_ADJUSTMENT = 0.9;

/**
 * Gets the number of days remaining in cover period by calculating difference
 * between the day after the end of the report period and the cover end date
 * @param reportPeriodEnd - The report period end
 * @param coverEndDate - The cover end date of the facility
 * @returns The number of days remaining in the cover period
 */
const getNumberOfDaysRemainingInCoverPeriod = (reportPeriodEnd: MonthAndYear, coverEndDate: Date): number => {
  const endDateOfReportPeriod = startOfDay(endOfMonth(getDateFromMonthAndYear(reportPeriodEnd)));
  const startDateOfNextReportPeriod = addDays(endDateOfReportPeriod, 1);

  return differenceInDays(coverEndDate, startDateOfNextReportPeriod);
};

export type CalculateFixedFeeParams = {
  utilisation: number;
  reportPeriod: ReportPeriod;
  coverEndDate: Date;
  interestPercentage: number;
  dayCountBasis: number;
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
  const interestPercentageAsDecimal = new Big(interestPercentage).div(100);
  return new Big(utilisation)
    .mul(interestPercentageAsDecimal)
    .mul(BANK_ADMIN_FEE_ADJUSTMENT)
    .mul(numberOfDaysRemainingInCoverPeriod)
    .div(dayCountBasis)
    .round(2)
    .toNumber();
};
