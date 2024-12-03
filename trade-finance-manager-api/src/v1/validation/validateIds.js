const validator = require('validator');
const { REGEX, TEAM_IDS } = require('../../constants');

/**
  Helper function to validate a given value against a given regex

 * @param regex - the regex to validate against
 * @param value - the value to validate
 * @returns Boolean - true if valid, false if not
 */
const isValidRegex = (regex, value) => regex.test(value);

/**
  Validates if a value is a valid mongo id

 * @param {string | import('mongodb').ObjectId} mongoId - the value to validate
 * @returns {boolean}
 */
const isValidMongoId = (mongoId) => (mongoId ? validator.isMongoId(mongoId.toString()) : false);

/**
  Validates if a value is a valid ukefNumericId using a regex defined in constants/regex.js

 * @param ukefId - the value to validate
 * @returns Boolean - true if valid, false if not
 */
const isValidUkefNumericId = (ukefId) => isValidRegex(REGEX.UKEF_ID, ukefId);

/**
  Validates if a value is a valid party urn using a regex defined in constants/regex.js

 * @param partyUrn - the value to validate
 * @returns Boolean - true if valid, false if not
 */
const isValidPartyUrn = (partyUrn) => isValidRegex(REGEX.PARTY_URN, partyUrn);

/**
  Validates if a value is a valid numeric ID using a regex defined in constants/regex.js

 * @param numericId - the value to validate
 * @returns Boolean - true if valid, false if not
 */
const isValidNumericId = (numericId) => isValidRegex(REGEX.NUMERIC_ID, numericId);

/**
  Validates if a value is a valid ISO 4217 currency code using validator.js package

 * @param currencyCode - the value to validate
 * @returns Boolean - true if valid, false if not
 */
const isValidCurrencyCode = (currencyCode) => (currencyCode ? validator.isISO4217(currencyCode.toString()) : false);

/**
  Sanitizes a username using validator.js package, escaping dangerous characters

 * @param username - the value to validate
 * @returns string - the sanitized username
 */
const sanitizeUsername = (username) => validator.escape(username.toString());

/**
  Validates if a value is a valid team ID using a list of all team IDs defined in constants/teams.js

 * @param {string} teamId - the value to validate
 * @returns {boolean} - true if valid, false if not
 */
const isValidTeamId = (teamId) => TEAM_IDS.includes(teamId);

module.exports = {
  isValidMongoId,
  isValidUkefNumericId,
  isValidPartyUrn,
  isValidNumericId,
  isValidCurrencyCode,
  sanitizeUsername,
  isValidTeamId,
};
