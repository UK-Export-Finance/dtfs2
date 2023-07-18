const validator = require('validator');

/**
 * isValidMongoId
 * validates that a passed mongoId is a valid one
 * returns true if so, false if not valid
 * @param {String} mongoId
 * @returns {Boolean}
 */
const isValidMongoId = (mongoId) => (mongoId ? validator.isMongoId(mongoId) : false);

module.exports = {
  isValidMongoId,
};
