import { addMonths, subMonths } from 'date-fns';
import { getOneIndexedMonth, toIsoMonthStamp } from './date';
import { IsoMonthStamp, MonthAndYear } from '../types/date';
import { BankReportPeriodSchedule } from '../types/db-models/banks';
import { ReportPeriod } from '../types/utilisation-reports';
import { isValidReportPeriod } from '../v1/validation/utilisation-report-service/utilisation-report-validator';

/**
 * Gets the report period start for the inputted submission month
 * @param submissionMonth - The submission month
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
 * @param monthAndYear - The month and year
 * @returns The submission month
 */
export const getSubmissionMonthForReportPeriodStart = (monthAndYear: MonthAndYear): IsoMonthStamp => {
  const { month, year } = monthAndYear;
  const submissionMonthDate = addMonths(new Date(year, month - 1), 1);
  return toIsoMonthStamp(submissionMonthDate);
};

/**
 * Gets the previous report period start relative to the inputted month and year
 * @param monthAndYear - The month and year
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
 * @param reportPeriodStart1 - A report period start
 * @param reportPeriodStart2 - The report period start to check against
 * @returns Whether or not the report period starts are equal
 */
export const isEqualReportPeriodStart = (reportPeriodStart1: MonthAndYear, reportPeriodStart2: MonthAndYear): boolean =>
  reportPeriodStart1.year === reportPeriodStart2.year && reportPeriodStart1.month === reportPeriodStart2.month;

/**
 * Get the report period for the inputted bank schedule by the target date
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
 * Gets the current report period for the inputted bank schedule
 * @param bankReportPeriodSchedule - The bank report period schedule
 * @returns The current report period
 */
export const getCurrentReportPeriodForBankSchedule = (bankReportPeriodSchedule: BankReportPeriodSchedule): ReportPeriod => {
  const previousMonthDate = subMonths(new Date(), 1);
  return getReportPeriodForBankScheduleByTargetDate(bankReportPeriodSchedule, previousMonthDate);
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

const extractReportPeriodFromJsonObject = (reportPeriodJson: object): ReportPeriod => {
  const invalidReportPeriodError = new Error('Supplied report period json object did not match the expected format');

  if (!('start' in reportPeriodJson)) {
    throw invalidReportPeriodError;
  }
  if (!('end' in reportPeriodJson)) {
    throw invalidReportPeriodError;
  }

  const { start, end } = reportPeriodJson;
  if (!(start instanceof Object) || !('month' in start) || !('year' in start)) {
    throw invalidReportPeriodError;
  }
  if (!(end instanceof Object) || !('month' in end) || !('year' in end)) {
    throw invalidReportPeriodError;
  }

  const reportPeriod: ReportPeriod = {
    start: {
      month: Number(start.month),
      year: Number(start.year),
    },
    end: {
      month: Number(end.month),
      year: Number(end.year),
    },
  };
  return reportPeriod;
};

/**
 * Parses the report period
 * @param reportPeriod - The stringified JSON object to parse
 * @returns The parsed report period
 * @throws If `reportPeriod` is an `object` but the `ReportPeriod` fields do not exist
 * @throws If the correct fields exist but the `month` and `year` properties are not numbers
 */
export const parseReportPeriod = (reportPeriod: object | undefined): ReportPeriod | undefined => {
  if (!reportPeriod) {
    return undefined;
  }

  const parsedReportPeriod = extractReportPeriodFromJsonObject(reportPeriod);
  if (!isValidReportPeriod(parsedReportPeriod)) {
    throw new Error(`'${JSON.stringify(reportPeriod)}' is not a valid report period`);
  }
  return parsedReportPeriod;
};
