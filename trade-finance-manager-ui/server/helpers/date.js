const { addBusinessDays, isSameDay, isWeekend, startOfMonth } = require('date-fns');

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

module.exports = {
  getBusinessDayOfMonth,
};
