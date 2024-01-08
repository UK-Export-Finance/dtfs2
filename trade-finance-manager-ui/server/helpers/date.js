const { addBusinessDays, isSameDay, isWeekend, startOfMonth, isValid, parseISO, format } = require('date-fns');

/**
 * @param {Date} date
 * @param {Date[]} holidays
 * @returns {boolean}
 */
const isHoliday = (date, holidays) => holidays.some((holiday) => isSameDay(date, holiday));

/**
 * Adds one business day to the provided date, taking into account weekends and
 * the provide list of holidays
 * @param {Date} date
 * @param {Date[]} holidays
 * @returns {Date}
 */
const addOneBusinessDayWithHolidays = (date, holidays) => {
  let nextBusinessDay = addBusinessDays(date, 1);

  while (isHoliday(nextBusinessDay, holidays)) {
    nextBusinessDay = addBusinessDays(nextBusinessDay, 1);
  }

  return nextBusinessDay;
};

/**
 * Given a date in the month and an array of holidays, this returns the first
 * non-weekend and non-holiday date in the month provided.
 * @param {Date} dateInMonth - A date in the required month
 * @param {Date[]} holidays - A list of dates which should be excluded as holidays
 * @returns {Date}
 */
const getFirstBusinessDayOfMonth = (dateInMonth, holidays) => {
  const firstBusinessDay = startOfMonth(dateInMonth);

  if (isWeekend(firstBusinessDay) || isHoliday(firstBusinessDay, holidays)) {
    return addOneBusinessDayWithHolidays(firstBusinessDay, holidays);
  }

  return firstBusinessDay;
};

/**
 * Given a date in the month, an array of holidays and a businessDay, it will
 * return the nth business day of the month. For example, a businessDay
 * index of 10 will return the 10th business day of the month.
 * @param {Date} dateInMonth - A date in the required month
 * @param {Date[]} holidays - A list of dates which should be excluded as holidays
 * @param {number} businessDay - The one-indexed business day to get
 * @returns {Date}
 */
const getBusinessDayOfMonth = (dateInMonth, holidays, businessDay) => {
  if (!Number.isInteger(businessDay) || businessDay < 1) {
    throw new Error(`businessDay must be a positive integer. Found ${businessDay}`);
  }

  let result = getFirstBusinessDayOfMonth(dateInMonth, holidays);

  for (let i = 1; i < businessDay; i += 1) {
    result = addOneBusinessDayWithHolidays(result, holidays);
  }

  return result;
};

/**
 * Converts date with index-0 month value to numeric index-1 month
 * @param {Date} date
 * @returns {number}
 */
const getOneIndexedMonth = (date) => date.getMonth() + 1;

/**
 * Returns and ISO month string (format 'yyyy-MM') corresponding to the provided
 * date value
 * @param {Date} dateInMonth - any day in the month of the required ISO month
 * @return {string} - ISO month string (format 'yyyy-MM')
 */
const getIsoMonth = (dateInMonth) => {
  if (!(dateInMonth instanceof Date)) {
    throw new Error(`Expected an instance of 'Date' - found '${dateInMonth}'`);
  }

  return format(dateInMonth, 'yyyy-MM');
};

const ISO_MONTH_REGEX = /^\d{4}-\d{2}$/;

/**
 * Checks whether the provided value is an ISO month string in format 'yyyy-MM'
 * @param {unknown} value - the value to test
 * @returns {boolean}
 */
const isValidIsoMonth = (value) => typeof value === 'string' && ISO_MONTH_REGEX.test(value) && isValid(parseISO(value));

/**
 * @param {unknown} value - the value to assert on
 * @throws {Error} - error thrown if the provided value is not an ISO month
 *   string in format 'yyyy-MM'
 */
const assertValidIsoMonth = (value) => {
  if (!isValidIsoMonth(value)) {
    throw new Error(`Invalid ISO month '${value}' - expected a string in format 'yyyy-MM'`);
  }
};

module.exports = {
  getBusinessDayOfMonth,
  getOneIndexedMonth,
  getIsoMonth,
  assertValidIsoMonth,
};
