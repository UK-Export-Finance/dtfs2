const validator = require('validator');

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

module.exports = {
  isValidMongoId,
  isValidRegex,
};
