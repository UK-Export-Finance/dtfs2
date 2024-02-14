import { isValidReportPeriod } from '../../../validation/utilisation-report-service/utilisation-report-validator';
import { ReportPeriod } from '../../../../types/utilisation-reports';

/**
 * Parses the report period
 * @param reportPeriod - The report period to parse
 * @returns The parsed report period
 * @throws {SyntaxError} If `reportPeriod` is a `string` but `JSON.parse` fails to parse it
 * @throws If the result of `JSON.parse(reportPeriod)` is not a valid `ReportPeriod` object
 */
export const parseReportPeriod = (reportPeriod: string | undefined): ReportPeriod | undefined => {
  if (!reportPeriod && typeof reportPeriod !== 'string') {
    return undefined;
  }

  const parsedReportPeriod = JSON.parse(reportPeriod) as unknown;
  if (!isValidReportPeriod(parsedReportPeriod)) {
    throw new Error(`'${JSON.stringify(parsedReportPeriod)}' is not a valid report period`);
  }
  return parsedReportPeriod;
};
