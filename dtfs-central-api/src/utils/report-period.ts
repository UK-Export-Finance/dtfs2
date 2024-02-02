import { addMonths, subMonths } from 'date-fns';
import { getOneIndexedMonth, toIsoMonthStamp } from './date';
import { IsoMonthStamp, MonthAndYear } from '../types/date';
import { BankReportPeriodSchedule } from '../types/db-models/banks';
import { ReportPeriod } from '../types/utilisation-reports';

/**
 * Gets the report period start for the inputted submission month
 * @param submissionMonth The submission month
 * @returns The report period start
 */
export const getReportPeriodStartForSubmissionMonth = (submissionMonth: IsoMonthStamp): MonthAndYear => {
  // TODO FN-1456 - calculate report period start month based on bank's report period schedule
  const reportPeriodDate = subMonths(new Date(submissionMonth), 1);
  return {
    month: getOneIndexedMonth(reportPeriodDate),
    year: reportPeriodDate.getFullYear(),
  };
};

/**
 * Gets the submission month for the report period starting at the inputted month and year
 * @param monthAndYear The month and year
 * @returns The submission month
 */
export const getSubmissionMonthForReportPeriodStart = (monthAndYear: MonthAndYear): IsoMonthStamp => {
  const { month, year } = monthAndYear;
  const submissionMonthDate = addMonths(new Date(year, month - 1), 1);
  return toIsoMonthStamp(submissionMonthDate);
};

/**
 * Gets the previous report period start relative to the inputted month and year
 * @param monthAndYear The month and year
 * @returns The previous report period start
 */
export const getPreviousReportPeriodStart = (monthAndYear: MonthAndYear): MonthAndYear => {
  const { month, year } = monthAndYear;
  // TODO FN-1456 - calculate report period start month based on bank's report period schedule
  const previousReportPeriodDate = subMonths(new Date(year, month - 1), 1);
  return {
    month: getOneIndexedMonth(previousReportPeriodDate),
    year: previousReportPeriodDate.getFullYear(),
  };
};

/**
 * Checks if the two report period starts are equal
 * @param reportPeriodStart1 A report period start
 * @param reportPeriodStart2 The report period start to check against
 * @returns Whether or not the report period starts are equal
 */
export const isEqualReportPeriodStart = (reportPeriodStart1: MonthAndYear, reportPeriodStart2: MonthAndYear): boolean =>
  reportPeriodStart1.year === reportPeriodStart2.year && reportPeriodStart1.month === reportPeriodStart2.month;

/**
 * Gets the current report period for the inputted bank schedule
 * @param bankReportPeriodSchedule The bank report period schedule
 * @returns The current report period
 */
export const getCurrentReportPeriodForBankSchedule = (bankReportPeriodSchedule: BankReportPeriodSchedule): ReportPeriod => {
  const previousMonthDate = subMonths(new Date(), 1);
  const targetMonth = getOneIndexedMonth(previousMonthDate);
  const targetYear = previousMonthDate.getFullYear();

  const scheduleInCurrentYear = bankReportPeriodSchedule.find((schedule) => targetMonth >= schedule.startMonth && targetMonth <= schedule.endMonth);
  if (scheduleInCurrentYear) {
    return {
      start: {
        month: scheduleInCurrentYear.startMonth,
        year: targetYear,
      },
      end: {
        month: scheduleInCurrentYear.endMonth,
        year: targetYear,
      },
    };
  }

  const scheduleOverlappingYear = bankReportPeriodSchedule.find((schedule) => schedule.startMonth > schedule.endMonth);
  if (!scheduleOverlappingYear) {
    throw new Error('Failed to get a report period');
  }

  const reportPeriodStartsInPreviousYear = targetMonth <= scheduleOverlappingYear.endMonth;
  return {
    start: {
      month: scheduleOverlappingYear.startMonth,
      year: reportPeriodStartsInPreviousYear ? targetYear - 1 : targetYear,
    },
    end: {
      month: scheduleOverlappingYear.endMonth,
      year: reportPeriodStartsInPreviousYear ? targetYear : targetYear + 1,
    },
  };
};
