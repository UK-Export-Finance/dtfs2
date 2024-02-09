import { subMonths } from 'date-fns';
import { ReportPeriodPartialEntity } from '../sql-db-entities/partial-entities';
import { getOneIndexedMonth } from './date';
import { BankReportPeriodSchedule, IsoMonthStamp } from '../types';

/**
 * Get the report period for the inputted bank schedule by the target date
 * @param bankReportPeriodSchedule - The bank report period schedule
 * @param dateInTargetReportPeriod - A date in the target report period
 * @returns The report period for the target report period
 */
const getReportPeriodForBankScheduleByTargetDate = (
  bankReportPeriodSchedule: BankReportPeriodSchedule,
  dateInTargetReportPeriod: Date,
): ReportPeriodPartialEntity => {
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
export const getCurrentReportPeriodForBankSchedule = (bankReportPeriodSchedule: BankReportPeriodSchedule): ReportPeriodPartialEntity => {
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
