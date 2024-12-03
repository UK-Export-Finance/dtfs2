import { ReportPeriod } from '@ukef/dtfs2-common';
import { validateMonth, validateYear } from '../v1/validation/utilisation-report-service/utilisation-report-validator';

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
 * Validates the report period for the utilisation report
 * @param reportPeriod - details of the report period.
 * @returns an array of errors or an empty array if valid.
 */
export const validateReportPeriod = (reportPeriod: unknown): string[] => {
  if (!reportPeriod || typeof reportPeriod !== 'object') {
    return ["Report period is not valid: 'reportPeriod' must be an object"];
  }

  if (!('start' in reportPeriod) || !reportPeriod.start || typeof reportPeriod.start !== 'object') {
    return ["Report period is not valid: 'reportPeriod.start' must be an object"];
  }

  if (!('end' in reportPeriod) || !reportPeriod.end || typeof reportPeriod.end !== 'object') {
    return ["Report period is not valid: 'reportPeriod.end' must be an object"];
  }

  const { start, end } = reportPeriod;

  if (!('month' in start) || !('year' in start)) {
    return ["Report period is not valid: 'reportPeriod.start' must contain 'month' and 'year' properties"];
  }

  if (!('month' in end) || !('year' in end)) {
    return ["Report period is not valid: 'reportPeriod.end' must contain 'month' and 'year' properties"];
  }

  const reportPeriodErrors = [];
  const { month: startMonth, year: startYear } = start;
  const { month: endMonth, year: endYear } = end;

  const startMonthError = validateMonth(startMonth, "'reportPeriod.start.month'");
  if (startMonthError !== null) {
    reportPeriodErrors.push(`Report period is not valid: ${startMonthError}`);
  }
  const startYearError = validateYear(startYear, "'reportPeriod.start.year'");
  if (startYearError !== null) {
    reportPeriodErrors.push(`Report period is not valid: ${startYearError}`);
  }

  const endMonthError = validateMonth(endMonth, "'reportPeriod.end.month'");
  if (endMonthError !== null) {
    reportPeriodErrors.push(`Report period is not valid: ${endMonthError}`);
  }
  const endYearError = validateYear(endYear, "'reportPeriod.end.year'");
  if (endYearError !== null) {
    reportPeriodErrors.push(`Report period is not valid: ${endYearError}`);
  }

  return reportPeriodErrors;
};

/**
 * Checks whether or not the supplied report period is a valid report period object
 * @param reportPeriod - details of the report period
 * @returns whether or not the report period is a valid report period
 */
export const isValidReportPeriod = (reportPeriod: unknown): reportPeriod is ReportPeriod => validateReportPeriod(reportPeriod).length === 0;

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
