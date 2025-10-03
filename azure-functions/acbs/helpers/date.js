const { isValid, parse, format, startOfDay, add, getDaysInMonth, formatISO, differenceInMonths, parseISO } = require('date-fns');

const validDateFormats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'yyyy MM dd'];

/**
 * @param {string} dateStr
 * @returns {boolean} true if the date string is a valid date in the format `yyyy-MM-dd`
 * Does not allow date of month to wrap or months > 12 (e.g 2024-13-32 is invalid)
 */
const isDate = (dateStr) => dateStr.length === 10 && isValid(parse(dateStr, 'yyyy-MM-dd', startOfDay(new Date())));

/**
 * @param {string | number} epoch
 * @returns {boolean} true if the value given is a unix epoch in seconds or milliseconds
 */
const isEpoch = (epoch) => Number.isInteger(Number(epoch)) && epoch !== '';

/**
 * @param {unknown} dateStr
 * @returns true if the value is a string and not an epoch
 */
const isString = (dateStr) => typeof dateStr === 'string' && !isEpoch(dateStr);

/**
 * @returns current date in format `yyyy-MM-dd`
 */
const now = () => format(new Date(), 'yyyy-MM-dd');

/**
 * @param {string | number} dateStr accepts epoch, iso date string, or {@link validDateFormats}
 * @returns {Date}
 */
const getDateFromStringOrNumber = (dateStr) => {
  const isoDate = parseISO(dateStr);
  const isValidIsoDate = isValid(isoDate);
  const dateFromString = validDateFormats.map((formatString) => parse(dateStr, formatString, startOfDay(new Date()))).find(isValid);
  const isValidEpoch = isEpoch(dateStr);

  if (isValidIsoDate) {
    return isoDate;
  }

  if (dateFromString) {
    return dateFromString;
  }

  if (isValidEpoch) {
    return new Date(Number(dateStr));
  }

  // Invalid date object if can't parse
  return new Date(NaN);
};

/**
 * @param {Date} date
 * @returns {string} date formatted as `yyyy-MM-dd` if valid or `Invalid date` otherwise
 *
 */
const formatOrReturnInvalidDate = (date) => (isValid(date) ? format(date, 'yyyy-MM-dd') : 'Invalid date');

/**
 * @param {number | string} year as a 2 or 4 digit number
 * @returns year formatted as 4 digits (adds 2000 if < 1000)
 */
const formatYear = (year) => (year < 1000 ? (2000 + parseInt(year, 10)).toString() : year && year.toString());
/**
 * @param {string | number} dateStr either epoch or {@link validDateFormats}
 * @returns {string} date formatted as `yyyy-MM-dd`, returns `Invalid date` if can't parse input
 */
const formatDate = (dateStr) => formatOrReturnInvalidDate(getDateFromStringOrNumber(dateStr));

/**
 * @param {string | number | Date} date either Date object, epoch or {@link validDateFormats}
 * @param {number} months number of months to add
 * @returns in the format `yyyy-MM-dd`.
 * Rounds down the date if target month is too short (e.g. 2024-01-31 plus 1 month is 2024-02-29)
 */
const addMonth = (date, months) => {
  const parsedDate = date instanceof Date ? date : getDateFromStringOrNumber(date);

  return formatOrReturnInvalidDate(add(parsedDate, { months }));
};
/**
 * @param {string | number | Date} date either Date object, epoch or {@link validDateFormats}
 * @param {number} years number of years to add
 * @returns in the format `yyyy-MM-dd`.
 * Rounds down the date if target month is too short (e.g. 2024-02-29 plus 1 year is 2025-02-28)
 */
const addYear = (date, years) => {
  const parsedDate = date instanceof Date ? date : getDateFromStringOrNumber(date);

  return formatOrReturnInvalidDate(add(parsedDate, { years }));
};

/**
 * @returns {string} current date as ISO-8601 string without milliseconds & with UTC offset (e.g. 2024-02-16T16:57:23+00:00)
 *
 * This maintains exact consistency with old moment behaviour:
 *  - `moment().format()` returns an ISO-8601 string with an offset, e.g. '+00:00'
 *  - `formatISO()` returns an ISO-8601 string with a 'Z' if the timezone is UTC
 */
const getNowAsIsoString = () => formatISO(new Date()).replace('Z', '+00:00');

/**
 * @param {string | Date | number | null} startDate either Date object, epoch or {@link validDateFormats}
 * @param {string | Date | number | null} endDate either Date object, epoch or {@link validDateFormats}
 * @returns {number} difference in months between dates, rounded up
 * The start date should be before the end date for this to have any meaning
 */
const getInclusiveMonthDifference = (startDate, endDate) => {
  let date1;
  let date2;
  if (startDate === null || endDate === null) {
    return NaN;
  }

  // if the date is undefined, use today
  if (startDate === undefined) {
    date1 = new Date();
  } else {
    date1 = startDate instanceof Date ? startDate : getDateFromStringOrNumber(startDate);
  }

  // if the date is undefined, use today
  if (endDate === undefined) {
    date2 = new Date();
  } else {
    date2 = endDate instanceof Date ? endDate : getDateFromStringOrNumber(endDate);
  }

  const monthDifference = differenceInMonths(date2, date1);
  const isSameDayOfMonth = date1.getDate() === date2.getDate();

  return isSameDayOfMonth ? monthDifference : monthDifference + 1;
};

/**
 * @param {string | number} day day of the month
 * @param {string | number} month 1 indexed month of the year
 * @param {string | number} year
 * @returns {string} formatted as `yyyy-MM-dd`
 */
const getDateStringFromYearMonthDay = (year, month, day) => {
  if (!month || !day || month > 12) {
    return 'Invalid date';
  }

  const yearAsNumber = Number(formatYear(year));
  const monthAsZeroIndexedNumber = Number(month) - 1;
  const dayAsNumber = Number(day);
  const startOfMonth = new Date(yearAsNumber, monthAsZeroIndexedNumber);

  const daysInMonth = getDaysInMonth(startOfMonth);

  if (daysInMonth < dayAsNumber) {
    return 'Invalid date';
  }

  const date = new Date(yearAsNumber, monthAsZeroIndexedNumber, dayAsNumber);

  return formatOrReturnInvalidDate(date);
};

/**
 * @param {string | number | Date} date either Date object, epoch or {@link validDateFormats}
 * @returns
 */
const getYearAndMmdd = (date) => {
  let parsedDate;

  if (date instanceof Date) {
    parsedDate = date;
  } else if (!date) {
    parsedDate = new Date();
  } else {
    parsedDate = getDateFromStringOrNumber(date);
  }

  return isValid(parsedDate)
    ? {
        mmdd: format(parsedDate, 'MM-dd'),
        year: format(parsedDate, 'yyyy'),
      }
    : {
        mmdd: 'Invalid date',
        year: 'Invalid date',
      };
};

module.exports = {
  validDateFormats,
  isDate,
  isEpoch,
  isString,
  now,
  formatDate,
  formatYear,
  addMonth,
  addYear,
  getNowAsIsoString,
  getInclusiveMonthDifference,
  getDateStringFromYearMonthDay,
  getYearAndMmdd,
};
