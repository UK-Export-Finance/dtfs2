const validator = require('validator');

/**
 * isValidMongoId
 * validates that a passed mongoId is a valid one
 * returns true if so, false if not valid
 * @param {string} mongoId
 * @returns {boolean}
 */
const isValidMongoId = (mongoId) => (mongoId ? validator.isMongoId(mongoId) : false);

/**
 * isValidRegex
 * validates value conforms to passed regex rules
 * @param {string} regex
 * @param {string} value
 * @returns {boolean} asserts if regex is matched or not
 */
const isValidRegex = (regex, value) => regex.test(value);

/**
 * isValidCurrencyCode
 * validates that passed code conforms to isISO4217 currency code format
 * returns true if so, false if not valid
 * @param {string} code
 * @returns {boolean}
 */
const isValidCurrencyCode = (code) => (code ? validator.isISO4217(String(code)) : false);

/**
 * isValidBankId
 * checks if bankId conforms to regex
 * @param {string} bankId
 * @returns {boolean} asserts if regex is matched
 */
const isValidBankId = (bankId) => isValidRegex(/^\d+$/, bankId);

/**
 * isValidMonth
 * checks if month is an integer between 1 and 12
 * @param {number} month
 * @returns {boolean} asserts if regex is matched
 */
const isValidMonth = (month) => Number.isInteger(month) && month >= 1 && month <= 12;

/**
 * isValidYear
 * checks if year is an integer between 2000 and 2100
 * @param {number} year
 * @returns {boolean} asserts if regex is matched
 */
const isValidYear = (year) => Number.isInteger(year) && year >= 2000 && year <= 2100;

/**
 * isValidReportPeriod
 * checks if the supplied report period is a valid report period object
 * @param {unknown} reportPeriod
 * @returns {boolean}
 */
const isValidReportPeriod = (reportPeriod) =>
  Boolean(
    reportPeriod &&
      reportPeriod.start &&
      isValidMonth(parseInt(reportPeriod.start.month, 10)) &&
      isValidYear(parseInt(reportPeriod.start.year, 10)) &&
      reportPeriod.end &&
      isValidMonth(parseInt(reportPeriod.end.month, 10)) &&
      isValidYear(parseInt(reportPeriod.end.year, 10)),
  );

module.exports = {
  isValidMongoId,
  isValidRegex,
  isValidCurrencyCode,
  isValidBankId,
  isValidMonth,
  isValidYear,
  isValidReportPeriod,
};
