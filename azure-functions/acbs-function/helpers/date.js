const { isValid, parse, format, startOfDay, add, getDaysInMonth, formatISO, differenceInMonths } = require('date-fns');

const validDateFormats = [
  'MM-dd-yy',
  'MM/dd/yy',
  'MM dd yy',
  'MM/dd/yyyy',
  'MM dd yyyy',
  'yyyy-MM-dd',
  'yyyy/MM/dd',
  'yyyy MM dd',
  'MM/dd/yyyyyy',
  'MM dd yyyyyy',
  'yyyyyy-MM-dd',
  'yyyyyy/MM/dd',
  'yyyyyy MM dd',
];

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
 * @param {string | number} dateStr
 * @returns {Date}
 *
 * Accepted date strings:
 *  - MM/dd/yyyy
 *  - MM dd yyyy
 *  - MM-dd-yy
 *  - MM/dd/yy
 *  - MM dd yy
 *  - yyyy-MM-dd
 *  - yyyy/MM/dd
 *  - yyyy MM dd
 */
const getDateFromStringOrNumber = (dateStr) => {
  const dateFromString = validDateFormats
    .map((formatString) => parse(dateStr, formatString, startOfDay(new Date())))
    .find(isValid);

  if (dateFromString) {
    return dateFromString;
  }

  if (isEpoch(dateStr)) {
    return new Date(Number(dateStr));
  }

  // Invalid date object if can't parse
  return new Date(NaN);
};

/**
 * @param {Date} date
 * @returns {string} date formatted as `yyyy-MM-dd` if valid or `Invalid date` otherwise
 */
const formatOrReturnInvalidDate = (date) => (isValid(date) ? format(date, 'yyyy-MM-dd') : 'Invalid date');

/**
 * @param {number | string} year as a 2 or 4 digit number
 * @returns year formatted as 4 digits (adds 2000 if < 1000)
 */
const formatYear = (year) => (year < 1000 ? (2000 + parseInt(year, 10)).toString() : year && year.toString());
/**
 * @param {string | number} dateStr
 * @returns {string} date formatted as `yyyy-MM-dd`, returns `Invalid date` if can't parse input
 * Accepted date strings:
 *  - MM/dd/yyyy
 *  - MM dd yyyy
 *  - MM-dd-yy
 *  - MM/dd/yy
 *  - MM dd yy
 *  - yyyy-MM-dd
 *  - yyyy/MM/dd
 *  - yyyy MM dd
 */
const formatDate = (dateStr) => formatOrReturnInvalidDate(
  getDateFromStringOrNumber(dateStr),
);

/**
 * @param {string | number | Date} date as a date string, epoch time or Date object
 * @param {number} day number of months to add
 * @returns in the format `yyyy-MM-dd`.
 * Rounds down the date if target month is too short (e.g. 2024-01-31 plus 1 month is 2024-02-29)
 *
 * Accepted date strings:
 *  - MM/dd/yyyy
 *  - MM dd yyyy
 *  - MM-dd-yy
 *  - MM/dd/yy
 *  - MM dd yy
 *  - yyyy-MM-dd
 *  - yyyy/MM/dd
 *  - yyyy MM dd
 */
const addMonth = (date, months) => {
  const parsedDate = date instanceof Date ? date : getDateFromStringOrNumber(date);

  return formatOrReturnInvalidDate(add(parsedDate, { months }));
};
/**
 * @param {string | number | Date} date as a date string, epoch time or Date object
 * @param {number} day number of months to add
 * @returns in the format `yyyy-MM-dd`.
 * Rounds down the date if target month is too short (e.g. 2024-02-29 plus 1 year is 2025-02-28)
 *
 * Accepted date strings:
 *  - MM/dd/yyyy
 *  - MM dd yyyy
 *  - MM-dd-yy
 *  - MM/dd/yy
 *  - MM dd yy
 *  - yyyy-MM-dd
 *  - yyyy/MM/dd
 *  - yyyy MM dd
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
 * @param {string | Date | number | null} startDate
 * @param {string | Date | number | null} endDate
 * @returns {number} difference in months between dates, rounded up
 * The start date should be before the end date for this to have any meaning
 *
 * Accepted date strings:
 *  - MM/dd/yyyy
 *  - MM dd yyyy
 *  - MM-dd-yy
 *  - MM/dd/yy
 *  - MM dd yy
 *  - yyyy-MM-dd
 *  - yyyy/MM/dd
 *  - yyyy MM dd
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

  const daysInMonth = getDaysInMonth(new Date(Number(formatYear(year)), Number(month) - 1));

  if (daysInMonth < Number(day)) {
    return 'Invalid date';
  }

  return formatOrReturnInvalidDate(
    new Date(
      Number(formatYear(year)),
      Number(month) - 1,
      Number(day),
    ),
  );
};

/**
 * @param {string | number | Date} date
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
