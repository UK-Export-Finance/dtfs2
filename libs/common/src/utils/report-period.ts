import { addMonths, subMonths } from 'date-fns';
import { getOneIndexedMonth, toIsoMonthStamp } from './date';
import { IsoMonthStamp, MonthAndYear, BankReportPeriodSchedule, ReportPeriod } from '../types';

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

  const currentScheduleIndexInCurrentYear = bankReportPeriodSchedule.findIndex(
    (schedule) => targetMonth >= schedule.startMonth && targetMonth <= schedule.endMonth,
  );

  if (currentScheduleIndexInCurrentYear >= 0) {
    const targetReportSchedule = bankReportPeriodSchedule[currentScheduleIndexInCurrentYear - 1];

    if (targetReportSchedule) {
      if (targetReportSchedule?.startMonth > targetReportSchedule?.endMonth) {
        return {
          start: {
            month: targetReportSchedule.startMonth,
            year: targetYear - 1,
          },
          end: {
            month: targetReportSchedule.endMonth,
            year: targetYear,
          },
        };
      }
      return {
        start: {
          month: targetReportSchedule.startMonth,
          year: targetYear,
        },
        end: {
          month: targetReportSchedule.endMonth,
          year: targetYear,
        },
      };
    }
    if (currentScheduleIndexInCurrentYear === 0) {
      const targetReportScheduleNotCurrentYearNotCurrentYear = bankReportPeriodSchedule.at(-1);
      return {
        start: {
          month: targetReportScheduleNotCurrentYearNotCurrentYear!.startMonth,
          year: targetYear - 1,
        },
        end: {
          month: targetReportScheduleNotCurrentYearNotCurrentYear!.endMonth,
          year: targetYear - 1,
        },
      };
    }
  }

  const currentScheduleIndexOverlappingYear = bankReportPeriodSchedule.findIndex((schedule) => schedule.startMonth > schedule.endMonth);
  if (currentScheduleIndexOverlappingYear < 0) {
    throw new Error('Failed to get a report period');
  }

  const targetReportSchedule = bankReportPeriodSchedule.at(-1);
  const reportPeriodStartsInPreviousYear = targetMonth <= targetReportSchedule!.endMonth;
  return {
    start: {
      month: targetReportSchedule!.startMonth,
      year: reportPeriodStartsInPreviousYear ? targetYear - 1 : targetYear,
    },
    end: {
      month: targetReportSchedule!.endMonth,
      year: reportPeriodStartsInPreviousYear ? targetYear - 1 : targetYear,
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
