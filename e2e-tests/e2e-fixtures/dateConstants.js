import { sub, add, format, getUnixTime } from 'date-fns';

export const SHORT_DAY_FORMAT = 'd';
export const LONG_DAY_FORMAT = 'dd';
export const SHORT_MONTH_FORMAT = 'M';
export const LONG_MONTH_FORMAT = 'MM';
export const LONG_YEAR_FORMAT = 'yyyy';
export const DD_MMM_YYYY_FORMAT = 'dd MMM yyyy';
export const D_MMMM_YYYY_FORMAT = 'd MMMM yyyy';
export const DD_MMMM_YYYY_FORMAT = 'dd MMMM yyyy';
export const TIME_HOURS_FORMAT = 'h';
export const TIME_AM_PM_FORMAT = 'aaa';
export const TIME_H_MMAAA = 'H:mmaaa';

const getFormattedValues = (date) => ({
  date,
  day: format(date, SHORT_DAY_FORMAT),
  dayLong: format(date, LONG_DAY_FORMAT),
  month: format(date, SHORT_MONTH_FORMAT),
  monthLong: format(date, LONG_MONTH_FORMAT),
  year: format(date, LONG_YEAR_FORMAT),
  dd_MMM_yyyy: format(date, DD_MMM_YYYY_FORMAT),
  d_MMMM_yyyy: format(date, D_MMMM_YYYY_FORMAT),
  dd_MMMM_yyyy: format(date, DD_MMMM_YYYY_FORMAT),
  h_MMAAA: format(date, TIME_H_MMAAA),
  unixSecondsString: getUnixTime(date).toString(),
  unixMillisecondsString: date.valueOf().toString(),
  unixMilliseconds: date.valueOf(),
});

const todayDate = new Date();

// Today
export const today = getFormattedValues(todayDate);

// Dates in the future
export const tomorrow = getFormattedValues(add(todayDate, { days: 1 }));
export const twoDays = getFormattedValues(add(todayDate, { days: 2 }));
export const threeDays = getFormattedValues(add(todayDate, { days: 3 }));
export const sevenDays = getFormattedValues(add(todayDate, { days: 7 }));
export const twentyEightDays = getFormattedValues(add(todayDate, { days: 28 }));
export const oneMonth = getFormattedValues(add(todayDate, { months: 1 }));
export const twoMonths = getFormattedValues(add(todayDate, { months: 2 }));
export const threeMonths = getFormattedValues(add(todayDate, { months: 3 }));
export const threeMonthsOneDay = getFormattedValues(add(todayDate, { months: 3, days: 1 }));
export const oneYear = getFormattedValues(add(todayDate, { years: 1 }));
export const twelveMonthsOneDay = getFormattedValues(add(todayDate, { months: 12, days: 1 }));
export const twoYears = getFormattedValues(add(todayDate, { years: 2 }));
export const threeYears = getFormattedValues(add(todayDate, { years: 3 }));
export const sixYearsOneDay = getFormattedValues(add(todayDate, { years: 6, months: 0, days: 1 }));

// Dates in the past
export const yesterday = getFormattedValues(sub(todayDate, { days: 1 }));
export const twoDaysAgo = getFormattedValues(sub(todayDate, { days: 2 }));
export const threeDaysAgo = getFormattedValues(sub(todayDate, { days: 3 }));
export const fourDaysAgo = getFormattedValues(sub(todayDate, { days: 4 }));
export const sevenDaysAgo = getFormattedValues(sub(todayDate, { days: 7 }));
export const twentyFiveDaysAgo = getFormattedValues(sub(todayDate, { days: 25 }));
export const thirtyFiveDaysAgo = getFormattedValues(sub(todayDate, { days: 35 }));
export const twelveMonthsOneDayAgo = getFormattedValues(sub(todayDate, { months: 12, days: 1 }));
export const oneYearAgo = getFormattedValues(sub(todayDate, { years: 1 }));
export const twoYearsAgo = getFormattedValues(sub(todayDate, { years: 2 }));

// Dates calculated from other values
/**
 * This constant is used for calculating the deadline for issuing a facility with submission date three days ago.
 */
export const threeDaysAgoPlusThreeMonths = getFormattedValues(add(threeDaysAgo.date, { months: 3 }));

// Times
export const todayTimeHours = format(todayDate, TIME_HOURS_FORMAT);
export const todayTimeAmPm = format(todayDate, TIME_AM_PM_FORMAT);

/**
 * Some tests check that validation errors appear,
 * If a year is entered with zero as a letter. I.e, O, instead of 0.
 */
export const yearWithZeroLetter = '2O22';
