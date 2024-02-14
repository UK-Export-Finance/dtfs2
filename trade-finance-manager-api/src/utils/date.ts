import { format, isValid, parseISO } from 'date-fns';
import moment from 'moment';

/**
 * @param date 
 * @returns Date as Unix timestamp representing the number of milliseconds between this date and 1st
 * January 1970 (UTC), stored as a string.
 */
export const getDateAsEpochMillisecondString = (date: Date) => date.valueOf().toString();

/**
 * @returns Current date as Unix timestamp representing the number of milliseconds between now and 1st
 * January 1970 (UTC), stored as a string.
 */
export const getNowAsEpochMillisecondString = () => getDateAsEpochMillisecondString(new Date());

/**
 * @param year as 2 or 4 digit number
 * @returns year in `yyyy` formatting (e.g. 24 becomes 2024)
 */
export const formatYear = (year: string | number) => (Number(year) < 1000 ? (2000 + parseInt(String(year), 10)).toString() : year && year.toString());

/**
 * @param dateStr 
 * @returns date formatted as `yyyy-MM-dd` or 'Invalid date' if not a valid format
 */
// TODO: DTFS2-6998: remove this function
export const formatDate = (dateStr: string) => moment(dateStr).format('YYYY-MM-DD');

/**
 * @param dateStr Unix timestamp representing number of milliseconds between this date and 1st January 1970 (UTC),
 * stored as a string 
 * @returns date formatted as `yyyy-MM-dd` or 'Invalid date' if not a number
 */
export const formatTimestamp = (dateStr: string) => {
  const date = new Date(Number(dateStr));

  return isValid(date) ? format(date, 'yyyy-MM-dd') : 'Invalid date';
};

/**
 * @param dateStr an ISO-8601 (or other) date string 
 * @returns Unix timestamp representing number of milliseconds between this date and 1st January 1970 (UTC),
 * stored as a string
 */
export const convertDateToTimestamp = (dateStr: string) => getDateAsEpochMillisecondString(new Date(dateStr));

const ISO_MONTH_REGEX = /^\d{4}-\d{2}$/;
/**
 * Checks whether the provided value is an ISO month string in format 'yyyy-MM'
 * @param {unknown} value - the value to test
 * @returns {boolean}
 */
export const isValidIsoMonth = (value: unknown) => typeof value === 'string' && ISO_MONTH_REGEX.test(value) && isValid(parseISO(value));
