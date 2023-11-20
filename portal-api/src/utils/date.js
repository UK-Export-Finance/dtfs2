const { addBusinessDays, format, isSameDay, isWeekend } = require('date-fns');

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
 * Given a start date and an array of holidays, this returns
 * the first business day relative to the start date provided.
 * For example, if the day is Monday and that day is not a
 * holiday, it will return the current date. If the date is
 * Saturday, and the next Monday is not a holiday, it will
 * return the next Monday.
 * @param {Date} firstDay - The first day (may be a business day)
 * @param {Date[]} holidays - A list of dates which should be excluded as holidays
 * @returns {Date}
 */
const getFirstBusinessDay = (firstDay, holidays) => {
  let firstBusinessDay = firstDay;
  if (isWeekend(firstBusinessDay)) {
    firstBusinessDay = addOneBusinessDayWithHolidays(firstBusinessDay, holidays);
  }
  while (isHoliday(firstBusinessDay, holidays)) {
    firstBusinessDay = addOneBusinessDayWithHolidays(firstBusinessDay, holidays);
  }
  return firstBusinessDay;
};

/**
 * Given a first day, an array of holidays and an index,
 * it will return the business day with that index. If the
 * index is one, and the start date is a business day, it
 * will return the date provided as that is the
 * first-indexed business day.
 * @param {Date} firstDay - The first day (index 1 if it is a business day)
 * @param {Date[]} holidays - A list of dates which should be excluded as holidays
 * @param {number} index - The one-indexed index of the business day to get
 * @returns {Date}
 */
const getBusinessDayByIndex = (firstDay, holidays, index) => {
  if (typeof index !== 'number' || index < 1) {
    throw new Error('Error getting business day by index: index must be a positive number');
  }

  const firstBusinessDay = getFirstBusinessDay(firstDay, holidays);
  if (index === 1) {
    return firstBusinessDay;
  }

  let indexBusinessDay = firstBusinessDay;
  for (let i = 1; i < index; i += 1) {
    indexBusinessDay = addOneBusinessDayWithHolidays(indexBusinessDay, holidays);
  }
  return indexBusinessDay;
};

/**
 * Returns the long month name associated with the given month number
 * @param {number} monthNumber - 1-indexed month number
 * @returns {string}
 */
const getMonthName = (monthNumber) => {
  const date = new Date(2023, monthNumber - 1);
  return format(date, 'MMMM');
};

module.exports = {
  addOneBusinessDayWithHolidays,
  getFirstBusinessDay,
  getBusinessDayByIndex,
  getMonthName,
};
