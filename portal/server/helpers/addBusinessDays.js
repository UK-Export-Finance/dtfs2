const { addBusinessDays, isSameDay } = require('date-fns');

/**
 * Adds the number of days given to the starting date provided excluding
 * weekends and holidays, if provided.
 * @param {Date} fromDate - The date value to start from.
 * @param {number} numberOfBusinessDays - The number of business days to increment by.
 * @param {Date[]} holidays - A list of dates which should be excluded as holidays.
 * @returns {Date} - The final date value.
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

module.exports = { addBusinessDaysWithHolidays };
