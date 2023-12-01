const moment = require('moment');
const { isValid, parseISO } = require('date-fns');

const formatYear = (year) => (year < 1000 ? (2000 + parseInt(year, 10)).toString() : year && year.toString());
const formatDate = (dateStr) => moment(dateStr).format('YYYY-MM-DD');
const formatTimestamp = (dateStr) => moment(Number(dateStr)).format('YYYY-MM-DD');
const convertDateToTimestamp = (dateStr) => moment(dateStr).valueOf().toString();

const ISO_MONTH_REGEX = /^\d{4}-\d{2}$/;

/**
 * Checks whether the provided value is an ISO month string in format 'yyyy-MM'
 * @param {unknown} value - the value to test
 * @returns {boolean}
 */
const isValidIsoMonth = (value) => typeof value === 'string' && ISO_MONTH_REGEX.test(value) && isValid(parseISO(value));

module.exports = {
  formatYear,
  formatDate,
  formatTimestamp,
  convertDateToTimestamp,
  isValidIsoMonth,
};
