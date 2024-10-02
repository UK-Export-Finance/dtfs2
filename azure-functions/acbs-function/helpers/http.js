/**
 * Verifies whether the response status is an HTTP error status or not.
 * @param {Object} status Response call status
 * @param {Object} ignore Additional status to ignore
 * @returns {boolean} Ascertain the response status with acceptable array of statuses
 */
const isHttpErrorStatus = (status, ignore = 0) => ![200, 201, ignore].includes(status);

module.exports = {
  isHttpErrorStatus,
};
