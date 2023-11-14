const { addBusinessDays, format, isSameDay } = require('date-fns');

/**
 * Adds business days to the given 'fromDate' also taking into account the given 'holidays'
 * @param {Date} fromDate - the date from which to add the business days
 * @param {number} numberOfBusinessDays - the number of business days to add to the 'fromDate'
 * @param {Date[]} holidays - an array of holidays to take into account
 * @returns {Date}
 */
const addBusinessDaysWithHolidays = (fromDate, numberOfBusinessDays, holidays) => {
  let result = fromDate;

  const isHoliday = (date) => holidays.some((holiday) => isSameDay(date, holiday));

  for (let i = 0; i < numberOfBusinessDays; i += 1) {
    result = addBusinessDays(result, 1);

    while (isHoliday(result)) {
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
