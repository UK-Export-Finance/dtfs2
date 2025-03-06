const { HttpStatusCode } = require('axios');

/**
 * Verifies whether the response status is an HTTP error status or not.
 * @param {Object} status Response call status
 * @param {Object} ignore Additional status to ignore
 * @returns {boolean} Ascertain the response status with acceptable array of statuses
 */
const isHttpErrorStatus = (status, ignore = 0) => ![HttpStatusCode.Ok, HttpStatusCode.Created, ignore].includes(status);

module.exports = {
  isHttpErrorStatus,
};
