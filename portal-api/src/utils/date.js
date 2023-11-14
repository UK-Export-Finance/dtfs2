const { addBusinessDays, format, isSameDay } = require('date-fns');

/**
 * Checks whether the given date is one of the given holiday dates
 * @param date {Date}
 * @param holidays {Date[]}
 * @returns {boolean}
 */
const isHoliday = (date, holidays) => holidays.some((holiday) => isSameDay(date, holiday));

/**
 * Adds business days to the given 'fromDate' also taking into account the given 'holidays'
 * @param {Date} fromDate - the date from which to add the business days
 * @param {number} numberOfBusinessDays - the number of business days to add to the 'fromDate'
 * @param {Date[]} holidays - an array of holidays to take into account
 * @returns {Date}
 */
const addBusinessDaysWithHolidays = (fromDate, numberOfBusinessDays, holidays) => {
  let result = fromDate;

  for (let i = 0; i < numberOfBusinessDays; i += 1) {
    result = addBusinessDays(result, 1);

    while (isHoliday(result, holidays)) {
      result = addBusinessDays(result, 1);
    }
  }

  return result;
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
  addBusinessDaysWithHolidays,
  getMonthName,
};
