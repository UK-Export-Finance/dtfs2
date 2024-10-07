import Big from 'big.js';
import { differenceInDays, isBefore, endOfMonth, addDays, startOfDay } from 'date-fns';
import { getDateFromMonthAndYear, MonthAndYear, ReportPeriod } from '@ukef/dtfs2-common';

/**
 * An admin fee (fixed at 10%) is applied to the fixed fee, meaning
 * we subtract this amount when calculating it
 */
const BANK_ADMIN_FEE_ADJUSTMENT = 0.9;

const getNumberOfDaysRemainingInCoverPeriod = (reportPeriodEnd: MonthAndYear, coverStartDate: Date, coverEndDate: Date): number => {
  const endDateOfReportPeriod = startOfDay(endOfMonth(getDateFromMonthAndYear(reportPeriodEnd)));
  const startDateOfNextReportPeriod = addDays(endDateOfReportPeriod, 1);

  if (isBefore(startDateOfNextReportPeriod, coverStartDate)) {
    return differenceInDays(coverEndDate, coverStartDate);
  }
  return differenceInDays(coverEndDate, startDateOfNextReportPeriod);
};

export type CalculateFixedFeeParams = {
  utilisation: number;
  reportPeriod: ReportPeriod;
  coverStartDate: Date;
  coverEndDate: Date;
  interestPercentage: number;
  dayCountBasis: number;
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
  const numberOfDaysRemainingInCoverPeriod = getNumberOfDaysRemainingInCoverPeriod(reportPeriod.end, coverStartDate, coverEndDate);
  const interestPercentageAsDecimal = new Big(interestPercentage).div(100);
  return new Big(utilisation)
    .mul(interestPercentageAsDecimal)
    .mul(BANK_ADMIN_FEE_ADJUSTMENT)
    .mul(numberOfDaysRemainingInCoverPeriod)
    .div(dayCountBasis)
    .round(2)
    .toNumber();
};
