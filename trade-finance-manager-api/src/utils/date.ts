import { UnixTimestampString, IsoDayStamp } from '@ukef/dtfs2-common';
import { format, formatISO, isValid, set, startOfDay } from 'date-fns';

/**
 * @param date
 * @returns Date as Unix timestamp representing the number of milliseconds between this date and 1st
 * January 1970 (UTC), stored as a string.
 */
export const getDateAsEpochMillisecondString = (date: Date): UnixTimestampString => date.valueOf().toString();

/**
 * @returns Current date as Unix timestamp representing the number of milliseconds between now and 1st
 * January 1970 (UTC), stored as a string.
 */
export const getNowAsEpochMillisecondString = (): UnixTimestampString => getDateAsEpochMillisecondString(new Date());

/**
 * @param year as 2 or 4 digit number
 * @returns year in `yyyy` formatting (e.g. 24 becomes 2024)
 */
export const formatYear = (year: string | number) => (Number(year) < 1000 ? (2000 + parseInt(String(year), 10)).toString() : year && year.toString());

/**
 * @param date
 * @returns date formatted as `yyyy-MM-dd` or 'Invalid date' if not a valid format
 */
export const formatDate = (date: Date): IsoDayStamp => (isValid(date) ? format(date, 'yyyy-MM-dd') : 'Invalid date');

/**
 * @param dateStr Unix timestamp representing number of milliseconds between this date and 1st January 1970 (UTC),
 * stored as a string
 * @returns date formatted as `yyyy-MM-dd` or 'Invalid date' if not a number
 */
export const formatTimestamp = (dateStr: string): IsoDayStamp => {
  const date = new Date(Number(dateStr));

  return isValid(date) ? format(date, 'yyyy-MM-dd') : 'Invalid date';
};

/**
 * @param dateStr an ISO-8601 (or other) date string
 * @returns Unix timestamp representing number of milliseconds between this date and 1st January 1970 (UTC),
 * stored as a string
 */
export const convertDateToTimestamp = (dateStr: string): UnixTimestampString => getDateAsEpochMillisecondString(new Date(dateStr));

/**
 * @param day the day of the month as a string
 * @param month month of the year as a string, starting at `'1'` = January
 * @param year year as a string
 * @returns start of the date
 */
export const getDateFromDayMonthYearStrings = (day: string, month: string, year: string) =>
  set(startOfDay(new Date()), {
    date: Number(day),
    month: Number(month) - 1, // Months are zero indexed
    year: Number(year),
  });

// TODO: DTFS2-6998: Assess if this function is needed
/**
 * @param day the day of the month as a string
 * @param month month of the year as a string, starting at `1` = January
 * @param year year as a string
 * @returns start of the date
 *
 * This function has odd behaviour inherited from moment js:
 *  - If the month is invalid return NaN
 *  - If the day/year is invalid, use the current day/year instead
 */
export const getDateFromDayMonthYearStringsReplicatingMoment = (day: string, month: string, year: string) => {
  // moment().set() returns invalid date if the month is invalid
  if (Number.isNaN(Number(month))) {
    return new Date(NaN);
  }
  // moment().set() treats NaN date & year like undefined
  return set(startOfDay(new Date()), {
    date: Number.isNaN(Number(day)) ? undefined : Number(day),
    month: Number(month) - 1, // months are zero indexed
    year: Number.isNaN(Number(year)) ? undefined : Number(year),
  });
};

/**
 * @param date
 * @returns ISO-8601 string with a UTC offset e.g. 2024-03-01T13:52:20+00:00
 *
 * This is needed to maintain exact consistency with old moment behaviour:
 *  - `moment().format()` returns an ISO-8601 string with an offset, e.g. '+00:00'
 *  - `formatISO()` returns an ISO-8601 string with a 'Z' if the timezone is UTC
 */
export const getIsoStringWithOffset = (date: Date) => formatISO(date).replace('Z', '+00:00');
