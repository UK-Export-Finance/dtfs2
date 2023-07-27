const validator = require('validator');
const { COMPANIES_HOUSE_NUMBER_REGEX } = require('../constants/regex');
const { FILE_UPLOAD } = require('../constants/file-upload');

/**
 * isValidMongoId
 * validates that a passed mongoId is a valid one
 * returns true if so, false if not valid
 * @param {String} mongoId
 * @returns {Boolean} Ascertain whether MongoID is valid or not.
 */
const isValidMongoId = (mongoId) => (mongoId ? validator.isMongoId(String(mongoId)) : false);

/**
 * isValidRegex
 * validates value conforms to passed regex rules
 * @param {String} regex
 * @param {String} value
 * @returns {Boolean} asserts if regex is matched or not
 */
const isValidRegex = (regex, value) => regex.test(value);

/**
 * isValidCompaniesHouseNumber
 * checks if companiesHouseNumber conforms to regex
 * @param {String} companiesHouseNumber
 * @returns {Boolean} asserts if regex is matched
 */
const isValidCompaniesHouseNumber = (companiesHouseNumber) => isValidRegex(COMPANIES_HOUSE_NUMBER_REGEX, companiesHouseNumber);

/**
 * isValidResetPasswordToken
 * Checks the value is hexadecimal
 * @param {String} value
 * @returns {Boolean}
 */
const isValidResetPasswordToken = (value) => validator.isHexadecimal(value);

/**
 * isValidDocumentType
 * Checks if the value is one of the allowed document types
 * @param {String} value
 * @returns {Boolean}
 */
const isValidDocumentType = (value) => FILE_UPLOAD.DOCUMENT_TYPES.includes(value);

module.exports = {
  isValidMongoId,
  isValidRegex,
  isValidCompaniesHouseNumber,
  isValidResetPasswordToken,
  isValidDocumentType,
};
