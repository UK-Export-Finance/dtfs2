const { sub, add, format, getUnixTime } = require('date-fns');

export const shortDayFormat = 'd';
export const longDayFormat = 'dd';
export const shortMonthFormat = 'M';
export const longMonthFormat = 'MM';
export const longYearFormat = 'yyyy';
export const ddMMMyyyyFormat = 'dd MMM yyyy';
export const dMMMMyyyyFormat = 'd MMMM yyyy';
export const ddMMMMyyyyFormat = 'dd MMMM yyyy';

const getFormattedValuesFromDate = (date) => {
  return {
    date,
    day: format(date, shortDayFormat),
    dayLong: format(date, longDayFormat),
    month: format(date, shortMonthFormat),
    monthLong: format(date, longMonthFormat),
    year: format(date, longYearFormat),
    ddMMMyyyy: format(date, ddMMMyyyyFormat),
    dMMMMyyyy: format(date, dMMMMyyyyFormat),
    ddMMMMyyyy: format(date, ddMMMMyyyyFormat),
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
export const todayFormattedTimeHours = format(todayDate, 'h');
export const todayFormattedTimeAmPm = format(todayDate, 'aaa');

// TODO: The below value does not match the variable name. We should investigate why the test that uses this still passes, and if the name or the value is incorrect.
export const threeDaysAgoPlusMonth = getFormattedValuesFromDate(add(threeDaysAgo.date, { months: 3 }));

/**
 * Some tests check that validation errors appear,
 * If a year is entered with zero as a letter. I.e, O, instead of 0.
 */
export const yearWithZeroLetter = '2O22';
