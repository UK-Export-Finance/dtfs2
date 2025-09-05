import { formatInTimeZone } from 'date-fns-tz';
import { format, getUnixTime } from 'date-fns';
import { IsoDateTimeStamp, OneIndexedMonth, UnixTimestampSeconds } from '../types/date';

/**
 * Returns the current date and time.
 *
 * @returns {Date} The current date and time.
 */
export const now = (): Date => new Date();

/**
 * Sets the seconds and milliseconds of the current date to zero.
 * @returns The current date and time in EPOCH, with seconds and milliseconds set to zero.
 */
export const nowZeroSeconds = (): number => now().setSeconds(0, 0);

/**
 * Returns the current date and time as a UTC ISO string.
 *
 * @returns {IsoDateTimeStamp} The current date and time in UTC formatted as an ISO string.
 */
export const getNowAsUtcISOString = (): IsoDateTimeStamp =>
  `${formatInTimeZone(new Date(), '+00:00', 'yyyy-MM-dd')}T${formatInTimeZone(new Date(), '+00:00', 'HH:mm:ss.SSS xxxxxx')}`;

/**
 * Returns the long month name associated with the given month number
 * @param monthNumber - 1-indexed month number
 * @returns month as a string
 */
export const getMonthName = (monthNumber: OneIndexedMonth) => {
  const currentYear = new Date().getFullYear();
  const date = new Date(currentYear, monthNumber - 1);
  return format(date, 'MMMM');
};

/**
 * Returns the Unix timestamp (seconds) associated with the given date
 * @param date - date to convert
 * @returns Unix timestamp in seconds
 */
export const getUnixTimestampSeconds: (date: Date) => UnixTimestampSeconds = getUnixTime;

/**
 * Returns the current date and time in ISO 8601 format.
 *
 * @param {Date} date JavaScript date object
 * @returns {string} The current date and time as an ISO 8601 string.
 */
export const getISO8601 = (date: Date = now()): string => date.toISOString();

/**
 * Adds a specified number of years to a given date.
 *
 * @param year - The number of years to add.
 * @param date - The date to which the years will be added. Defaults to the current date and time.
 * @returns A new Date object with the specified number of years added.
 */
export const addYear = (year: number, date: Date = now()): Date => new Date(date.setFullYear(date.getFullYear() + year));

/**
 * Returns the epoch time in milliseconds for a given date.
 *
 * @param {Date} [date=now()] - The date for which to get the epoch time. Defaults to the current date and time if not provided.
 * @returns {number} The epoch time in milliseconds.
 */
export const getEpochMs = (date: Date = now()): number => new Date(date).valueOf();

/**
 * Returns the given date formatted as a long date string.
 *
 * @param {Date} [date=now()] - The date to format. Defaults to the current date and time if not provided.
 * @returns {string} The formatted date string in the format 'd MMMM yyyy'.
 */
export const getLongDateFormat = (date: Date = now()): string => format(date, 'd MMMM yyyy');

/**
 * Converts a Unix timestamp to a 10-digit format by removing milliseconds.
 *
 * @param unixTimestamp - The Unix timestamp to convert, which may include milliseconds.
 * @returns The Unix timestamp without milliseconds (10-digit format).
 */
export const convertUnixTimestampWithoutMilliseconds = (unixTimestamp: number): number => Number(String(unixTimestamp).substring(0, 10));

/**
 * Returns a formatted date string in the format "hh:mm a on cccc dd MMMM YYYY" for a given epoch time in milliseconds.
 *
 * @param epoch - The epoch time in milliseconds to format. Defaults to the current epoch time if not provided.
 * @returns The formatted date string.
 */
export const getLongTimeDateFormat = (epoch: number = getEpochMs()): string => format(epoch, "hh:mmaaa 'on' cccc dd MMMM yyyy");
