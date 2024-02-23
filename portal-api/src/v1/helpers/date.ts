import { format, set, startOfDay } from 'date-fns';
import { DATE_FORMATS } from '../../constants';

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
 * 
 * @param value Unix timestamp representing the number of milliseconds between the date and 1st
 * January 1970 (UTC), stored as a string.
 * @returns The start of the day representing this timestamp
 */
export const getStartOfDateFromEpochMillisecondString = (value: string) => startOfDay(new Date(Number(value)));

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

// TODO: DTFS2-7024 Remove the odd behaviour inherited from moment js
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
 * @returns date formatted as `do MMMM yyyy`, e.g. 1st February 2024
 */
export const getLongFormattedDate = (date: Date) => format(date, DATE_FORMATS.LONG_FORM_DATE);
