const validator = require('validator');
const REGEX = require('../constants/regex');

/**
  Helper function to validate a given value against a given regex

 * @param regex - the regex to validate against
 * @param value - the value to validate
 * @returns Boolean - true if valid, false if not
 */
const isValidRegex = (regex, value) => regex.test(value);

/**
  Validates if a value is a valid group id

 * @param groupId - the value to validate
 * @returns Boolean - true if valid, false if not
 */
const isValidGroupId = (groupId) => isValidRegex(REGEX.INT, groupId);

/**
  Validates if a value is a valid group id

 * @param taskId - the value to validate
 * @returns Boolean - true if valid, false if not
 */
const isValidTaskId = (taskId) => isValidRegex(REGEX.INT, taskId);

/**
  Validates if a value is a valid mongo id

 * @param mongoId - the value to validate
 * @returns Boolean - true if valid, false if not
 */
const isValidMongoId = (mongoId) => (mongoId ? validator.isMongoId(mongoId.toString()) : false);

/**
  Validates if a value is a valid party urn using a regex defined in constants/regex.js

 * @param partyUrn - the value to validate
 * @returns Boolean - true if valid, false if not
 */
const isValidPartyUrn = (partyUrn) => isValidRegex(REGEX.PARTY_URN, partyUrn);

module.exports = {
  isValidMongoId,
  isValidGroupId,
  isValidTaskId,
  isValidPartyUrn,
};
