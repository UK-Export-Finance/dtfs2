import { MonthAndYear } from '../types/date';

/**
 * Returns the current datetime as a 13 digit Unix timestamp: the time in
 * milliseconds that has elapsed since 1st January 1970 (UTC).
 *
 * e.g. A Unix timestamp of 1702900314 is equivalent to an ISO 8601 date time
 * stamp of '2023-12-18T11:51:54Z'
 *
 */
export const getNowAsEpoch = () => Date.now();

/**
 * Checks whether or not two `MonthAndYear` objects are equal
 * @param monthAndYear1 - A month and year object
 * @param monthAndYear2 - The month and year object to compare against
 * @returns Whether or not the objects match
 */
export const isEqualMonthAndYear = (monthAndYear1: MonthAndYear, monthAndYear2: MonthAndYear): boolean =>
  monthAndYear1.month === monthAndYear2.month && monthAndYear1.year === monthAndYear2.year;

/**
 * Gets the date from the inputted month and year
 * @param monthAndYear - The month and year object
 * @returns The date
 */
export const getDateFromMonthAndYear = (monthAndYear: MonthAndYear): Date => new Date(monthAndYear.year, monthAndYear.month - 1);
