import { format } from 'date-fns';
import { ReportPeriod } from '../types/utilisation-reports';
import { getDateFromMonthAndYear, isEqualMonthAndYear } from './date';

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
