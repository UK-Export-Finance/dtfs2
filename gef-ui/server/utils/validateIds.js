const validator = require('validator');
const { COMPANIES_HOUSE_NUMBER_REGEX, UK_POSTCODE_REGEX } = require('../constants');

/**
 * isValidMongoId
 * Validates that a passed value is a valid mongo id
 * It must be a hexadecimal string of 24 characters
 * @param {String} value
 * @returns {Boolean}
 */
const isValidMongoId = (value) => (value ? validator.isMongoId(String(value)) : false);

/**
 * isValidCompaniesHouseNumber
 * validates value conforms to passed regex rules
 * @param {String} value
 * @returns {Boolean} asserts if regex is matched or not
 */
const isValidCompaniesHouseNumber = (value) => COMPANIES_HOUSE_NUMBER_REGEX.test(value);

/**
 * isValidUkPostcode
 * Checks the value is in the format of a UK Postcode
 * @param {String} value
 * @returns {Boolean}
 */
const isValidUkPostcode = (value) => UK_POSTCODE_REGEX.test(value);

module.exports = {
  isValidMongoId,
  isValidCompaniesHouseNumber,
  isValidUkPostcode,
};
