const applyRules = require('./submission-details-rules');

/**
 * Applies a set of rules to the requested update and returns an object containing the count of errors and the error list.
 * @param {any} requestedUpdate - The input data to be processed by the rules.
 * @returns {Promise<{ count: number, errorList: Object }>} - An object with the count of errors and the error list.
 */
module.exports = async (requestedUpdate) => {
  const errorList = await applyRules(requestedUpdate);
  const count = Object.keys(errorList).length;
  return { count, errorList };
};
