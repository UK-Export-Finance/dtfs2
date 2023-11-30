const { format } = require('date-fns');

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
  getMonthName,
};
