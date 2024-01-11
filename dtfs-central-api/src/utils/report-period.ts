import { addMonths, subMonths } from 'date-fns';
import { getOneIndexedMonth, toIsoMonthStamp } from './date';
import { IsoMonthStamp } from '../types/date';
import { ReportPeriodStart } from '../types/utilisation-reports';
import { UtilisationReport } from '../types/db-models/utilisation-reports';

export const getReportPeriodStartForUtilisationReport = ({ reportPeriod }: UtilisationReport): ReportPeriodStart => (reportPeriod.start);

export const getReportPeriodStartForSubmissionMonth = (submissionMonth: IsoMonthStamp): ReportPeriodStart => {
  // TODO FN-1456 - calculate report period start month based on bank's report period schedule
  const reportPeriodDate = subMonths(new Date(submissionMonth), 1);
  return {
    month: getOneIndexedMonth(reportPeriodDate),
    year: reportPeriodDate.getFullYear(),
  };
};

export const getSubmissionMonthForReportPeriodStart = ({ month, year }: ReportPeriodStart): IsoMonthStamp => {
  const submissionMonthDate = addMonths(new Date(year, month - 1), 1);
  return toIsoMonthStamp(submissionMonthDate);
};

export const getPreviousReportPeriodStart = ({ month, year }: ReportPeriodStart): ReportPeriodStart => {
  // TODO FN-1456 - calculate report period start month based on bank's report period schedule
  const previousReportPeriodDate = subMonths(new Date(year, month - 1), 1);
  return {
    month: getOneIndexedMonth(previousReportPeriodDate),
    year: previousReportPeriodDate.getFullYear(),
  };
};

export const isEqualReportPeriodStart = (reportPeriodStart1: ReportPeriodStart, reportPeriodStart2: ReportPeriodStart): boolean =>
  reportPeriodStart1.year === reportPeriodStart2.year && reportPeriodStart1.month === reportPeriodStart2.month;
