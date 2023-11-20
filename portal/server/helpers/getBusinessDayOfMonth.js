const { addBusinessDays, isSameDay, isWeekend, startOfMonth } = require('date-fns');

/**
 * @param {Date} date
 * @param {Date[]} holidays
 * @returns {boolean}
 */
const isHoliday = (date, holidays) => holidays.some((holiday) => isSameDay(date, holiday));

/**
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
 * Given a month, year and an array of holidays, this returns
 * the first business day of the month in the year provided.
 * For example, if the 1st of the month is a Monday and that
 * day is not a holiday, it will return the current date. If
 * the 1st is a Saturday, and the next Monday is not a holiday,
 * it will return the next Monday.
 * @param {number} month - The month (one-indexed)
 * @param {number} year - The year
 * @param {Date[]} holidays - A list of dates which should be excluded as holidays
 * @returns {Date}
 */
const getFirstBusinessDayOfMonth = (month, year, holidays) => {
  let firstBusinessDay = startOfMonth(new Date(year, month - 1));
  if (isWeekend(firstBusinessDay)) {
    firstBusinessDay = addOneBusinessDayWithHolidays(firstBusinessDay, holidays);
  }
  while (isHoliday(firstBusinessDay, holidays)) {
    firstBusinessDay = addOneBusinessDayWithHolidays(firstBusinessDay, holidays);
  }
  return firstBusinessDay;
};

/**
 * Given a month (and year), an array of holidays and an
 * index, it will return the business day with that index.
 * If the index is one, and the start date is a business
 * day, it will return the date provided as that is the
 * first-indexed business day.
 * @param {number} month - The month (one-indexed)
 * @param {number} year - The year
 * @param {Date[]} holidays - A list of dates which should be excluded as holidays
 * @param {number} businessDay - The one-indexed business day to get
 * @returns {Date}
 */
const getBusinessDayOfMonth = (month, year, holidays, businessDay) => {
  if (typeof businessDay !== 'number' || businessDay < 1) {
    throw new Error('Error getting business day: business day must be a positive number');
  }

  const firstBusinessDay = getFirstBusinessDayOfMonth(month, year, holidays);
  if (businessDay === 1) {
    return firstBusinessDay;
  }

  let indexBusinessDay = firstBusinessDay;
  for (let i = 1; i < businessDay; i += 1) {
    indexBusinessDay = addOneBusinessDayWithHolidays(indexBusinessDay, holidays);
  }
  return indexBusinessDay;
};

module.exports = {
  addOneBusinessDayWithHolidays,
  getFirstBusinessDayOfMonth,
  getBusinessDayOfMonth,
};
