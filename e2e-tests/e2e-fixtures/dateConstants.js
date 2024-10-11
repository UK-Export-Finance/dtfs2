const { sub, add, format, getUnixTime } = require('date-fns');

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

const getFormattedValuesFromDate = (date) => {
  return {
    date,
    day: format(date, SHORT_DAY_FORMAT),
    dayLong: format(date, LONG_DAY_FORMAT),
    month: format(date, SHORT_MONTH_FORMAT),
    monthLong: format(date, LONG_MONTH_FORMAT),
    year: format(date, LONG_YEAR_FORMAT),
    dd_MMM_yyyy: format(date, DD_MMM_YYYY_FORMAT),
    d_MMMM_yyyy: format(date, D_MMMM_YYYY_FORMAT),
    dd_MMMM_yyyy: format(date, DD_MMMM_YYYY_FORMAT),
    unixSecondsString: getUnixTime(date).toString(),
    unixMillisecondsString: date.valueOf().toString(),
    unixMilliseconds: date.valueOf(),
  };
};

const todayDate = new Date();

// Today
export const today = getFormattedValuesFromDate(todayDate);

// Dates in the future
export const tomorrow = getFormattedValuesFromDate(add(todayDate, { days: 1 }));
export const twoDays = getFormattedValuesFromDate(add(todayDate, { days: 2 }));
export const threeDays = getFormattedValuesFromDate(add(todayDate, { days: 3 }));
export const sevenDays = getFormattedValuesFromDate(add(todayDate, { days: 7 }));
export const twentyEightDays = getFormattedValuesFromDate(add(todayDate, { days: 28 }));
export const oneMonth = getFormattedValuesFromDate(add(todayDate, { months: 1 }));
export const twoMonths = getFormattedValuesFromDate(add(todayDate, { months: 2 }));
export const threeMonthsMinusThreeDays = getFormattedValuesFromDate(add(todayDate, { months: 3, days: -3 }));
export const threeMonths = getFormattedValuesFromDate(add(todayDate, { months: 3 }));
export const threeMonthsOneDay = getFormattedValuesFromDate(add(todayDate, { months: 3, days: 1 }));
export const oneYear = getFormattedValuesFromDate(add(todayDate, { years: 1 }));
export const twelveMonthsOneDay = getFormattedValuesFromDate(add(todayDate, { months: 12, days: 1 }));
export const twoYears = getFormattedValuesFromDate(add(todayDate, { years: 2 }));
export const threeYears = getFormattedValuesFromDate(add(todayDate, { years: 3 }));
export const sixYearsOneDay = getFormattedValuesFromDate(add(todayDate, { years: 6, months: 0, days: 1 }));

// Dates in the past
export const yesterday = getFormattedValuesFromDate(sub(todayDate, { days: 1 }));
export const twoDaysAgo = getFormattedValuesFromDate(sub(todayDate, { days: 2 }));
export const threeDaysAgo = getFormattedValuesFromDate(sub(todayDate, { days: 3 }));
export const fourDaysAgo = getFormattedValuesFromDate(sub(todayDate, { days: 4 }));
export const sevenDaysAgo = getFormattedValuesFromDate(sub(todayDate, { days: 7 }));
export const twentyFiveDaysAgo = getFormattedValuesFromDate(sub(todayDate, { days: 25 }));
export const thirtyFiveDaysAgo = getFormattedValuesFromDate(sub(todayDate, { days: 35 }));
export const twelveMonthsOneDayAgo = getFormattedValuesFromDate(sub(todayDate, { months: 12, days: 1 }));
export const oneYearAgo = getFormattedValuesFromDate(sub(todayDate, { years: 1 }));
export const twoYearsAgo = getFormattedValuesFromDate(sub(todayDate, { years: 2 }));

// Times
export const todayTimeHours = format(todayDate, TIME_HOURS_FORMAT);
export const todayTimeAmPm = format(todayDate, TIME_AM_PM_FORMAT);

/**
 * Some tests check that validation errors appear,
 * If a year is entered with zero as a letter. I.e, O, instead of 0.
 */
export const yearWithZeroLetter = '2O22';
