import { isEqualMonthAndYear, OneIndexedMonth, ReportPeriod } from '@ukef/dtfs2-common';
import { MONTH_NAMES, FILE_UPLOAD } from '../../../constants';

/**
 * Gets the regex group for all the possible month representations we
 * are expecting for the supplied one indexed month
 * @param oneIndexedMonth - The one indexed month
 * @returns A regex string for the given month and year combination
 * @throws {Error} If a month matching the supplied `longMonthName` cannot be found
 */
const getMonthRegexString = (oneIndexedMonth: OneIndexedMonth): string => {
  const monthNames = Object.values(MONTH_NAMES).find(({ index }) => index === oneIndexedMonth);
  if (!monthNames) {
    throw new Error(`Failed to find month names for one indexed month '${oneIndexedMonth}'`);
  }
  return `(${monthNames.long}|${monthNames.short}|${monthNames.numeric})`;
};

/**
 * Gets the regex instance for the supplied report period using
 * the format which is expected for the filename
 * @param dueReportPeriod - The due report period
 * @returns The regex for the supplied report period
 * @example
 * // Monthly, January 2024
 * const dueReportPeriod = {
 *   start: { month: 1, year: 2024 },
 *   end: { month: 1, year: 2024 },
 * };
 * const filenameReportPeriodRegex = getFilenameReportPeriodRegex(
 *   dueReportPeriod,
 * ); // equivalent to '/(January|Jan|01)[-_]2024/i'
 *
 * // Quarterly, November 2023 to February 2024
 * const dueReportPeriod = {
 *   start: { month: 11, year: 2023 },
 *   end: { month: 2, year: 2024 },
 * };
 * const filenameReportPeriodRegex = getFilenameReportPeriodRegex(
 *   dueReportPeriod,
 * ); // equivalent to '/(February|Feb|02)[-_]2024/i'
 */
const getFilenameReportPeriodRegex = (dueReportPeriod: ReportPeriod): RegExp => {
  const endMonthRegexString = getMonthRegexString(dueReportPeriod.end.month);
  const endYear = dueReportPeriod.end.year.toString();
  const regexString = [endMonthRegexString, endYear].join(FILE_UPLOAD.FILENAME_SEPARATOR_GROUP);
  return new RegExp(regexString, 'i');
};

/**
 * Checks whether or not the supplied report period exists in the supplied filename
 * @param dueReportPeriod - The due report period
 * @param filename - The filename
 * @return A boolean indicating whether or not the supplied report period exists on the supplied file name
 */
const isReportPeriodInFilename = (dueReportPeriod: ReportPeriod, filename: string): boolean => {
  const filenameReportPeriodRegex = getFilenameReportPeriodRegex(dueReportPeriod);
  return filenameReportPeriodRegex.test(filename);
};

/**
 * Gets an example filename for the specified report period
 * @param dueReportPeriod - The due report period
 * @returns An example filename
 * @example
 * const dueReportPeriod = {
 *   start: { month: 1, year: 2024 },
 *   end: { month: 3, year: 2024 },
 * };
 * const exampleFilenameReportPeriod = getExampleFilenameReportPeriod(dueReportPeriod); // '03-2024'
 */
const getExampleFilenameReportPeriod = (dueReportPeriod: ReportPeriod): string => {
  const exampleFilename = `${dueReportPeriod.end.month}-${dueReportPeriod.end.year}`;

  const singleDigitMonthRegex = /^(\d{1}-)/;
  const replacePattern = '0$1';
  return exampleFilename.replace(singleDigitMonthRegex, replacePattern);
};

/**
 * Given a filename and a report period, this function checks whether
 * or not the filename contains a month and, if it does, whether or
 * not the month matches the report period passed in. If it does match,
 * it returns an empty object. Otherwise, it returns an object containing
 * a filename error message related to the specific case reached
 * @param filename - The filename, using either '_' or '-' as a separator
 * @param dueReportPeriod - The due report period
 * @returns Object containing file name error if present, or empty object if no error
 */
export const validateFilenameFormat = (filename: string, dueReportPeriod: ReportPeriod): { filenameError?: string } => {
  if (filename.includes(FILE_UPLOAD.FILENAME_SUBMITTED_INDICATOR)) {
    const filenameError = `Report filename must not contain '${FILE_UPLOAD.FILENAME_SUBMITTED_INDICATOR}'`;
    return { filenameError };
  }

  const isMonthlyReportPeriod = isEqualMonthAndYear(dueReportPeriod.start, dueReportPeriod.end);
  if (isMonthlyReportPeriod && !/monthly/i.test(filename)) {
    const filenameError = "The selected file must contain the word 'monthly'";
    return { filenameError };
  }
  if (!isMonthlyReportPeriod && !/quarterly/i.test(filename)) {
    const filenameError = "The selected file must contain the word 'quarterly'";
    return { filenameError };
  }

  if (!isReportPeriodInFilename(dueReportPeriod, filename)) {
    const exampleFilenameReportPeriod = getExampleFilenameReportPeriod(dueReportPeriod);
    const filenameError = `The selected file must contain the reporting period as part of its name, for example '${exampleFilenameReportPeriod}'`;
    return { filenameError };
  }
  return {};
};
