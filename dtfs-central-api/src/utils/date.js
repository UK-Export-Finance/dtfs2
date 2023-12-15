const { isValid, parseISO } = require('date-fns');

/**
 * Converts date with index-0 month value to numeric index-1 month
 * @param {Date} date - date with index-0 month
 * @returns {number} - Numeric month value with index-1
 */
const getOneIndexedMonth = (date) => date.getMonth() + 1;

const ISO_MONTH_REGEX = /^\d{4}-\d{2}$/;

/**
 * Checks whether the provided value is an ISO month string in format 'yyyy-MM'
 * @param {unknown} value - the value to test
 * @returns {boolean}
 */
const isValidIsoMonth = (value) => typeof value === 'string' && ISO_MONTH_REGEX.test(value) && isValid(parseISO(value));

module.exports = {
  getOneIndexedMonth,
  isValidIsoMonth,
};
