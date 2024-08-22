const validator = require('validator');
const { UK_POSTCODE_REGEX } = require('../constants');

/**
 * isValidMongoId
 * Validates that a passed value is a valid mongo id.
 * It must be a hexadecimal string of 24 characters
 * @param {string} value
 * @returns {boolean}
 */
const isValidMongoId = (value) => (value ? validator.isMongoId(String(value)) : false);

/**
 * isValidUkPostcode
 * Checks the value is in the format of a UK Postcode
 * @param {string} value
 * @returns {boolean}
 */
const isValidUkPostcode = (value) => UK_POSTCODE_REGEX.test(value);

module.exports = {
  isValidMongoId,
  isValidUkPostcode,
};
