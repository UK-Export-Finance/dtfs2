import { ReportPeriod } from "../types/utilisation-reports";
import { format } from 'date-fns';

export const formatReportPeriodToString = (reportPeriod: ReportPeriod): string => {
  const startOfReportPeriod = new Date(reportPeriod.start.year, reportPeriod.start.month - 1);
  const endOfReportPeriod = new Date(reportPeriod.end.year, reportPeriod.end.month - 1)
  if (reportPeriod.start.month === reportPeriod.end.month) {
    return format(endOfReportPeriod, 'MMMM yyyy');
  }
  const formattedEndOfPeriod = format(endOfReportPeriod, 'MMMM yyyy');
  let formattedStartOfPeriod = format(startOfReportPeriod, 'MMMM yyyy');
  if (reportPeriod.start.year === reportPeriod.end.year) {
    formattedStartOfPeriod = format(startOfReportPeriod, 'MMMM');
  }
  return `${formattedStartOfPeriod} to ${formattedEndOfPeriod}`;
};
