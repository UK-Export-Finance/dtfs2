import { ReportPeriod } from '../types/utilisation-reports';
import { isValidReportPeriod } from '../v1/validation/utilisation-report-service/utilisation-report-validator';

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
