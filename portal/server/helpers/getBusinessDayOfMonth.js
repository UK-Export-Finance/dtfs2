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
 * Given a date in the month and an array of holidays, this
 * returns the first business day of the month in the year
 * provided. For example, if the 1st of the month is a Monday
 * and that day is not a holiday, it will return the current
 * date. If the 1st is a Saturday, and the next Monday is not
 * a holiday, it will return the next Monday.
 * @param {Date} dateInMonth - A date in the required month
 * @param {Date[]} holidays - A list of dates which should be excluded as holidays
 * @returns {Date}
 */
const getFirstBusinessDayOfMonth = (dateInMonth, holidays) => {
  let firstBusinessDay = startOfMonth(dateInMonth);

  if (isWeekend(firstBusinessDay) || isHoliday(firstBusinessDay, holidays)) {
    firstBusinessDay = addOneBusinessDayWithHolidays(firstBusinessDay, holidays);
  }

  return firstBusinessDay;
};

/**
 * Given a date in the month, an array of holidays and a
 * businessDay index, it will return the business day with
 * that index. For example, a businessDay index of 1 will
 * return the first business day of the month.
 * @param {Date} dateInMonth - A date in the required month
 * @param {Date[]} holidays - A list of dates which should be excluded as holidays
 * @param {number} businessDay - The one-indexed business day to get
 * @returns {Date}
 */
const getBusinessDayOfMonth = (dateInMonth, holidays, businessDay) => {
  if (!Number.isInteger(businessDay) || businessDay < 1) {
    throw new Error('Error getting business day: business day must be a positive number');
  }

  const firstBusinessDay = getFirstBusinessDayOfMonth(dateInMonth, holidays);
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
