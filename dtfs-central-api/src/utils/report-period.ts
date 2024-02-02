import { addMonths, subMonths } from 'date-fns';
import { getOneIndexedMonth, toIsoMonthStamp } from './date';
import { IsoMonthStamp, MonthAndYear } from '../types/date';
import { BankReportPeriodSchedule } from '../types/db-models/banks';
import { ReportPeriod } from '../types/utilisation-reports';

export const getReportPeriodStartForSubmissionMonth = (submissionMonth: IsoMonthStamp): MonthAndYear => {
  // TODO FN-1456 - calculate report period start month based on bank's report period schedule
  const reportPeriodDate = subMonths(new Date(submissionMonth), 1);
  return {
    month: getOneIndexedMonth(reportPeriodDate),
    year: reportPeriodDate.getFullYear(),
  };
};

export const getSubmissionMonthForReportPeriodStart = ({ month, year }: MonthAndYear): IsoMonthStamp => {
  const submissionMonthDate = addMonths(new Date(year, month - 1), 1);
  return toIsoMonthStamp(submissionMonthDate);
};

export const getPreviousReportPeriodStart = ({ month, year }: MonthAndYear): MonthAndYear => {
  // TODO FN-1456 - calculate report period start month based on bank's report period schedule
  const previousReportPeriodDate = subMonths(new Date(year, month - 1), 1);
  return {
    month: getOneIndexedMonth(previousReportPeriodDate),
    year: previousReportPeriodDate.getFullYear(),
  };
};

export const isEqualReportPeriodStart = (reportPeriodStart1: MonthAndYear, reportPeriodStart2: MonthAndYear): boolean =>
  reportPeriodStart1.year === reportPeriodStart2.year && reportPeriodStart1.month === reportPeriodStart2.month;

const getReportPeriodForBankScheduleByMonthAndYear = (bankReportPeriodSchedule: BankReportPeriodSchedule, dateInTargetReportPeriod: Date): ReportPeriod => {
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

export const getCurrentReportPeriodForBankSchedule = (bankReportPeriodSchedule: BankReportPeriodSchedule): ReportPeriod => {
  const previousMonthDate = subMonths(new Date(), 1);
  return getReportPeriodForBankScheduleByMonthAndYear(bankReportPeriodSchedule, previousMonthDate);
};

export const getReportPeriodForBankScheduleBySubmissionMonth = (bankReportPeriodSchedule: BankReportPeriodSchedule, submissionMonth: IsoMonthStamp) => {
  const submissionMonthDate = new Date(submissionMonth);
  const previousMonthDate = subMonths(submissionMonthDate, 1);
  return getReportPeriodForBankScheduleByMonthAndYear(bankReportPeriodSchedule, previousMonthDate);
};
