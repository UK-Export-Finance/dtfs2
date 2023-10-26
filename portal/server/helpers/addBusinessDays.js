const { addBusinessDays, isSameDay } = require('date-fns');

/**
 * Adds the number of days given to the starting date provided excluding
 * weekends and holidays, if provided.
 * @param {Date} startingDate - The date value to start from.
 * @param {Integer} numberOfDays - The number of business days to increment by.
 * @param {Array} holidays - A list of dates which should be excluded as holidays.
 * @returns {Date} - The final date value.
 */

const addBusinessDaysWithHolidays = (startingDate, numberOfDays, holidays) => {
  let result = startingDate;
  for (let i = 0; i < numberOfDays; i += 1) {
    let temporaryDate = addBusinessDays(result, 1);
    const isHoliday = holidays.some((holiday) => isSameDay(temporaryDate, holiday));
    if (isHoliday) { temporaryDate = addBusinessDays(temporaryDate, 1); }
    result = temporaryDate;
  }
  return result;
};

module.exports = { addBusinessDaysWithHolidays };
