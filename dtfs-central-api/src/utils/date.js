const { isValid, parseISO } = require('date-fns');

const ISO_MONTH_REGEX = /^\d{4}-\d{2}$/;

/**
 * Checks whether the provided value is an ISO month string in format 'yyyy-MM'
 * @param {unknown} value - the value to test
 * @returns {boolean}
 */
const isValidIsoMonth = (value) => typeof value === 'string' && ISO_MONTH_REGEX.test(value) && isValid(parseISO(value));

module.exports = {
  isValidIsoMonth,
};
