const { getMonth } = require('date-fns');

/**
 * Converts date with index-0 month value to numeric index-1 month
 * @param {Date} date - date with index-0 month
 * @returns {number} - Numeric month value with index-1
 */
const getOneIndexedMonth = (date) => {
  const month = getMonth(date);
  return month + 1;
};

module.exports = { getOneIndexedMonth };
