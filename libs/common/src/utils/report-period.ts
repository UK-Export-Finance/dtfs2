import { addMonths, subMonths, format } from 'date-fns';
import { getOneIndexedMonth, toIsoMonthStamp, getDateFromMonthAndYear, isEqualMonthAndYear } from './date';
import { IsoMonthStamp, MonthAndYear, BankReportPeriodSchedule, ReportPeriod } from '../types';

/**
 * Gets the report period end for the inputted submission month
 * @param submissionMonth - The submission month
 * @returns The report period end
 */
export const getReportPeriodEndForSubmissionMonth = (submissionMonth: IsoMonthStamp): MonthAndYear => {
  // TODO FN-1456 - calculate report period start month based on bank's report period schedule
  const reportPeriodDate = subMonths(new Date(submissionMonth), 1);
  return {
    month: getOneIndexedMonth(reportPeriodDate),
    year: reportPeriodDate.getFullYear(),
  };
};

/**
 * Gets the submission month for the report period ending at the inputted month and year
 * @param monthAndYear - The month and year
 * @returns The submission month
 */
export const getSubmissionMonthForReportPeriodEnd = (monthAndYear: MonthAndYear): IsoMonthStamp => {
  const { month, year } = monthAndYear;
  const submissionMonthDate = addMonths(new Date(year, month - 1), 1);
  return toIsoMonthStamp(submissionMonthDate);
};

/**
 * Get the current report period for the inputted bank schedule by the target date
 * @param bankReportPeriodSchedule - The bank report period schedule
 * @param dateInTargetReportPeriod - A date in the target report period
 * @returns The report period for the target report period
 */
const getReportPeriodForBankScheduleByTargetDate = (bankReportPeriodSchedule: BankReportPeriodSchedule, dateInTargetReportPeriod: Date): ReportPeriod => {
  const targetMonth = getOneIndexedMonth(dateInTargetReportPeriod);
  const targetYear = dateInTargetReportPeriod.getFullYear();

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

/**
 * Get the previous report period for the inputted bank schedule by the target date by getting the index of
 * the current report period and getting the previous element.
 * @param bankReportPeriodSchedule - The bank report period schedule
 * @param dateInTargetReportPeriod - A date in the target report period
 * @returns The previous report period for the target report period
 */
const getPreviousReportPeriodForBankScheduleByTargetDate = (
  bankReportPeriodSchedule: BankReportPeriodSchedule,
  dateInTargetReportPeriod: Date,
): ReportPeriod => {
  const targetMonth = getOneIndexedMonth(dateInTargetReportPeriod);
  const targetYear = dateInTargetReportPeriod.getFullYear();
  const indexOfCurrentSchedule = bankReportPeriodSchedule.findIndex(
    (schedule) =>
      (schedule.startMonth <= targetMonth && targetMonth <= schedule.endMonth) ||
      (schedule.startMonth > schedule.endMonth && targetMonth >= schedule.endMonth && targetMonth >= schedule.startMonth) ||
      (schedule.startMonth > schedule.endMonth && targetMonth <= schedule.endMonth && targetMonth <= schedule.startMonth),
  );
  if (indexOfCurrentSchedule === -1) {
    throw new Error('Failed to find a schedule');
  }
  const targetReportSchedule = bankReportPeriodSchedule[indexOfCurrentSchedule - 1] ?? bankReportPeriodSchedule.at(-1)!;
  const isTargetReportPeriodStartInPreviousYear = targetMonth < targetReportSchedule.startMonth;
  const isTargetReportPeriodEndInPreviousYear = targetMonth < targetReportSchedule.endMonth;
  return {
    start: {
      month: targetReportSchedule.startMonth,
      year: isTargetReportPeriodStartInPreviousYear ? targetYear - 1 : targetYear,
    },
    end: {
      month: targetReportSchedule.endMonth,
      year: isTargetReportPeriodEndInPreviousYear ? targetYear - 1 : targetYear,
    },
  };
};

/**
 * Gets the next report period for the inputted bank schedule
 * @param bankReportPeriodSchedule - The bank report period schedule
 * @returns The current report period
 */
export const getNextReportPeriodForBankSchedule = (bankReportPeriodSchedule: BankReportPeriodSchedule): ReportPeriod => {
  const currentMonthDate = new Date();
  return getReportPeriodForBankScheduleByTargetDate(bankReportPeriodSchedule, currentMonthDate);
};

/**
 * Gets the current report period for the inputted bank schedule
 * @param bankReportPeriodSchedule - The bank report period schedule
 * @returns The current report period
 */
export const getCurrentReportPeriodForBankSchedule = (bankReportPeriodSchedule: BankReportPeriodSchedule): ReportPeriod => {
  const currentMonthDate = new Date();
  return getPreviousReportPeriodForBankScheduleByTargetDate(bankReportPeriodSchedule, currentMonthDate);
};

/**
 * Gets the current report period for the inputted bank schedule for the inputted submission month
 * @param bankReportPeriodSchedule - The bank report period schedule
 * @param submissionMonth - The submission month
 * @returns The report period for the submission month
 */
export const getReportPeriodForBankScheduleBySubmissionMonth = (bankReportPeriodSchedule: BankReportPeriodSchedule, submissionMonth: IsoMonthStamp) => {
  const submissionMonthDate = new Date(submissionMonth);
  const previousMonthDate = subMonths(submissionMonthDate, 1);
  return getReportPeriodForBankScheduleByTargetDate(bankReportPeriodSchedule, previousMonthDate);
};

/**
 * Gets the formatted report period
 * @param reportPeriod - The report period
 * @returns The formatted report period
 * @example
 * const reportPeriod = {
 *   start: { month: 1, year: 2024 },
 *   end: { month: 1, year: 2024 },
 * };
 *
 * const formattedReportPeriod = getFormattedReportPeriod(reportPeriod);
 * console.log(formattedReportPeriod); // January 2024
 * @example
 * const reportPeriod = {
 *   start: { month: 1, year: 2024 },
 *   end: { month: 2, year: 2024 },
 * };
 *
 * const formattedReportPeriod = getFormattedReportPeriod(reportPeriod);
 * console.log(formattedReportPeriod); // January to February 2024
 * @example
 * const reportPeriod = {
 *   start: { month: 12, year: 2023 },
 *   end: { month: 1, year: 2024 },
 * };
 *
 * const formattedReportPeriod = getFormattedReportPeriod(reportPeriod);
 * console.log(formattedReportPeriod); // December 2023 to January 2024
 */
export const getFormattedReportPeriod = (reportPeriod: ReportPeriod): string => {
  const startOfReportPeriod = getDateFromMonthAndYear(reportPeriod.start);
  const endOfReportPeriod = getDateFromMonthAndYear(reportPeriod.end);

  const formattedEndOfPeriod = format(endOfReportPeriod, 'MMMM yyyy');
  if (isEqualMonthAndYear(reportPeriod.start, reportPeriod.end)) {
    return formattedEndOfPeriod;
  }

  const formattedStartOfPeriod =
    reportPeriod.start.year === reportPeriod.end.year ? format(startOfReportPeriod, 'MMMM') : format(startOfReportPeriod, 'MMMM yyyy');
  return `${formattedStartOfPeriod} to ${formattedEndOfPeriod}`;
};
