import { addMonths, subMonths } from 'date-fns';
import { getOneIndexedMonth, toIsoMonthStamp } from './date';
import { IsoMonthStamp, MonthAndYear } from '../types/date';
import { ReportPeriodSchedule } from '../types/db-models/banks';
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

export const getCurrentReportPeriodForBankSchedule = (bankReportPeriodSchedule: ReportPeriodSchedule[]): ReportPeriod => {
  const currentReportPeriodDate = subMonths(new Date(), 1);
  const oneIndexedPreviousMonth = getOneIndexedMonth(currentReportPeriodDate);
  const currentYear = currentReportPeriodDate.getFullYear();

  const reportPeriodInPreviousYear = bankReportPeriodSchedule.find(
    (schedule) => schedule.startMonth > schedule.endMonth && (oneIndexedPreviousMonth >= schedule.startMonth || oneIndexedPreviousMonth <= schedule.endMonth),
  );
  if (reportPeriodInPreviousYear) {
    return {
      start: {
        month: reportPeriodInPreviousYear.startMonth,
        year: currentYear - 1,
      },
      end: {
        month: reportPeriodInPreviousYear.endMonth,
        year: currentYear,
      },
    };
  }

  const reportPeriodInCurrentYear = bankReportPeriodSchedule.find(
    (schedule) => schedule.startMonth <= oneIndexedPreviousMonth && oneIndexedPreviousMonth <= schedule.endMonth,
  );

  if (!reportPeriodInCurrentYear) {
    console.error('Failed to get current report period start for bank with report schedule %O', bankReportPeriodSchedule);
    throw new Error('Failed to get current report period start for bank');
  }

  return {
    start: {
      month: reportPeriodInCurrentYear.startMonth,
      year: currentYear,
    },
    end: {
      month: reportPeriodInCurrentYear.endMonth,
      year: currentYear,
    },
  };
};
