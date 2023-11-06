const validator = require('validator');
const { COMPANIES_HOUSE_NUMBER_REGEX } = require('../../constants/regex');

/**
 * isValidMongoId
 * validates that a passed mongoId is a valid one
 * returns true if so, false if not valid
 * @param {String} mongoId
 * @returns {Boolean}
 */
const isValidMongoId = (mongoId) => (mongoId ? validator.isMongoId(mongoId) : false);

/**
 * isValidRegex
 * validates value conforms to passed regex rules
 * @param {String} regex
 * @param {String} value
 * @returns {Boolean} asserts if regex is matched or not
 */
const isValidRegex = (regex, value) => regex.test(value);

/**
 * isValidCurrencyCode
 * validates that passed code conforms to isISO4217 currency code format
 * returns true if so, false if not valid
 * @param {String} code
 * @returns {Boolean}
 */
const isValidCurrencyCode = (code) => (code ? validator.isISO4217(String(code)) : false);

/**
 * isValidCompaniesHouseNumber
 * checks if companiesHouseNumber conforms to regex
 * @param {String} companiesHouseNumber
 * @returns {Boolean} asserts if regex is matched
 */
const isValidCompaniesHouseNumber = (companiesHouseNumber) => isValidRegex(COMPANIES_HOUSE_NUMBER_REGEX, companiesHouseNumber);

/**
 * isValidBankId
 * checks if bankId conforms to regex
 * @param {String} bankId
 * @returns {Boolean} asserts if regex is matched
 */
const isValidBankId = (bankId) => isValidRegex(/^\d+$/, bankId);

/**
 * isValidMonth
 * checks if month is an integer between 1 and 12
 * @param {Number} month
 * @returns {Boolean} asserts if regex is matched
 */
const isValidMonth = (month) => Number.isInteger(month) && month >= 1 && month <= 12;

const isValidYear = (year) => Number.isInteger(year) && year >= 2000 && year <= 2100;

module.exports = {
  isValidMongoId,
  isValidRegex,
  isValidCurrencyCode,
  isValidCompaniesHouseNumber,
  isValidBankId,
  isValidMonth,
  isValidYear,
};
