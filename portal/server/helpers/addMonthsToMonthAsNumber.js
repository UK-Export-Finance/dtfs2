const { setMonth, addMonths, getMonth } = require('date-fns');

/**
 * Adds numberToAdd to month with index-1
 * @param {number} month - month with index-1
 * @param {number} numberToAdd
 * @returns {number} - Numeric month value with index-1
 */
const addMonthsToMonthAsNumber = (month, numberToAdd) => {
  const date = new Date();
  const dateWithSetMonth = setMonth(date, month - 1);
  const dateWithAddedMonths = addMonths(dateWithSetMonth, numberToAdd);
  return getMonth(dateWithAddedMonths) + 1;
};

module.exports = { addMonthsToMonthAsNumber };
