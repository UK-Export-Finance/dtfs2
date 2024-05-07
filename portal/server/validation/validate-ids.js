const validator = require('validator');
const { COMPANIES_HOUSE_NUMBER_REGEX, FILE_NAME_REGEX } = require('../constants/regex');
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
 * isValidUserId validates that a userId is a valid MongoId.
 * @param {string} userId
 * @returns {boolean} True if the userId is a valid MongoID, false otherwise.
 */
const isValidUserId = (userId) => isValidMongoId(userId);

/**
 * isValidSignInToken validates that a signInToken is a valid hex string.
 * @param {string} signInToken
 * @returns {boolean} True if the signInToken is a valid hex string, false otherwise.
 */
const isValidSignInToken = (signInToken) => (signInToken ? validator.isHexadecimal(signInToken) : false);

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
const isValidCompaniesHouseNumber = (companiesHouseNumber) =>
  isValidRegex(COMPANIES_HOUSE_NUMBER_REGEX, companiesHouseNumber);

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

/**
 * isValidFileName
 * Checks if the value is of the format of "[filename].[allowedFileExtension]""
 * @param {String} value
 * @returns {Boolean}
 */
const isValidFileName = (value) => FILE_NAME_REGEX.test(value);

/**
 * isValidBankId
 * checks if bankId conforms to regex
 * @param {String} bankId
 * @returns {Boolean} asserts if regex is matched
 */
const isValidBankId = (bankId) => isValidRegex(/^\d+$/, bankId);

/**
 * isValidSqlId
 * checks if id conforms to regex
 * @param {String} id
 * @returns {Boolean} asserts if regex is matched
 */
const isValidSqlId = (id) => isValidRegex(/^\d+$/, id);

module.exports = {
  isValidMongoId,
  isValidUserId,
  isValidSignInToken,
  isValidRegex,
  isValidCompaniesHouseNumber,
  isValidResetPasswordToken,
  isValidDocumentType,
  isValidFileName,
  isValidBankId,
  isValidSqlId,
};
