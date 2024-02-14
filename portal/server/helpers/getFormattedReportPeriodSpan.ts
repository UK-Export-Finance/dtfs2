import { format } from 'date-fns';
import { ReportPeriod } from '../types/utilisation-reports';

/**
 * Gets the formatted report period span
 * @param reportPeriod - The report period
 * @returns The formatted report period span
 * @example
 * const reportPeriod = {
 *   start: { month: 1, year: 2024 },
 *   end: { month: 1, year: 2024 },
 * };
 *
 * const formattedReportPeriodSpan = getFormattedReportPeriodSpan(reportPeriod);
 * console.log(formattedReportPeriodSpan); // January 2024
 * @example
 * const reportPeriod = {
 *   start: { month: 1, year: 2024 },
 *   end: { month: 2, year: 2024 },
 * };
 *
 * const formattedReportPeriodSpan = getFormattedReportPeriodSpan(reportPeriod);
 * console.log(formattedReportPeriodSpan); // January to February 2024
 * @example
 * const reportPeriod = {
 *   start: { month: 12, year: 2023 },
 *   end: { month: 1, year: 2024 },
 * };
 *
 * const formattedReportPeriodSpan = getFormattedReportPeriodSpan(reportPeriod);
 * console.log(formattedReportPeriodSpan); // December 2023 to January 2024
 */
export const getFormattedReportPeriodSpan = (reportPeriod: ReportPeriod): string => {
  const startOfReportPeriod = new Date(reportPeriod.start.year, reportPeriod.start.month - 1);
  const endOfReportPeriod = new Date(reportPeriod.end.year, reportPeriod.end.month - 1);
  
  const formattedEndOfPeriod = format(endOfReportPeriod, 'MMMM yyyy');
  if (reportPeriod.start.year === reportPeriod.end.year && reportPeriod.start.month === reportPeriod.end.month) {
    return formattedEndOfPeriod;
  }

  const formattedStartOfPeriod =
    reportPeriod.start.year === reportPeriod.end.year ? format(startOfReportPeriod, 'MMMM') : format(startOfReportPeriod, 'MMMM yyyy');
  return `${formattedStartOfPeriod} to ${formattedEndOfPeriod}`;
};
