const validator = require('validator');
const joi = require('joi');

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
 * @returns
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
 * isNotValidCompaniesHouseNumber
 * checks if companiesHouseNumber conforms to schema
 * returns true if validation error or false if not
 * @param {String} companiesHouseNumber
 * @returns {Boolean}
 */
const isNotValidCompaniesHouseNumber = (companiesHouseNumber) => {
  const schema = joi.string().alphanum().min(6).max(8)
    .required();

  const validation = schema.validate(companiesHouseNumber);

  return Boolean(validation.error);
};

module.exports = {
  isValidMongoId,
  isValidRegex,
  isValidCurrencyCode,
  isNotValidCompaniesHouseNumber,
};
