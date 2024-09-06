const { isMongoId } = require('validator');
const { REGEX } = require('../../../constants');

/**
 * Validate the ID of a utilisation report
 * @param {unknown} reportId - the report ID
 * @returns {string | null} - error message or null if valid
 */
const validateReportId = (reportId) => {
  if (Number.isInteger(reportId) && reportId > 0) {
    return null;
  }

  return `Report ID must be a positive integer`;
};

/**
 * Validates the month of the utilisation report. Returns null if valid, otherwise returns an error message.
 * @param {unknown} month - Month of utilisation report.
 * @param {string} [propertyName] - Name of specific property being validated (defaults to `'Month'`).
 * @returns {string | null} - Error message or null if valid.
 */
const validateMonth = (month, propertyName = 'Month') => {
  if (!month && month !== 0) {
    return `${propertyName} is required`;
  }
  if (!REGEX.INTEGER_REGEX.test(month) || month < 1 || month > 12) {
    return `${propertyName} must be between 1 and 12`;
  }
  return null;
};

/**
 * Validates the year of the utilisation report. Returns null if valid, otherwise returns an error message.
 * @param {unknown} year - Year of utilisation report.
 * @param {string} [propertyName] - Name of specific property being validated (defaults to `'Year'`).
 * @returns {string | null} - Error message or null if valid.
 */
const validateYear = (year, propertyName = 'Year') => {
  if (!year && year !== 0) {
    return `${propertyName} is required`;
  }
  if (!REGEX.INTEGER_REGEX.test(year) || year < 2020 || year > 2100) {
    return `${propertyName} must be between 2020 and 2100`;
  }
  return null;
};

/**
 * Validates the details of the file storage for the utilisation report in azure
 * @param {unknown} fileInfo - details of the file storage for the utilisation report in azure.
 * @returns {string[]} - an array of errors or an empty array if valid.
 */
const validateFileInfo = (fileInfo) => {
  if (!fileInfo) {
    return ['File info is required'];
  }

  const fileInfoErrors = [];
  const { folder, filename, fullPath, url, mimetype } = fileInfo;
  if (!folder) {
    fileInfoErrors.push('Folder name from file info is required');
  } else if (typeof folder !== 'string') {
    fileInfoErrors.push('Folder name from file info must be a string');
  }
  if (!filename) {
    fileInfoErrors.push('Filename from file info is required');
  } else if (typeof filename !== 'string') {
    fileInfoErrors.push('Filename from file info must be a string');
  }
  if (!fullPath) {
    fileInfoErrors.push('Full path from file info is required');
  } else if (typeof fullPath !== 'string') {
    fileInfoErrors.push('Full path from file info must be a string');
  }
  if (!url) {
    fileInfoErrors.push('Url from file info is required');
  } else if (typeof url !== 'string') {
    fileInfoErrors.push('Url from file info must be a string');
  }
  if (!mimetype) {
    fileInfoErrors.push('Mimetype from file info is required');
  } else if (typeof mimetype !== 'string') {
    fileInfoErrors.push('Mimetype from file info must be a string');
  }
  return fileInfoErrors;
};

/**
 * Validates the user associated with a utilisation report
 * @param {unknown} user - the user
 * @returns {string[]} - an array of errors or an empty array if valid.
 */
const validateReportUser = (user) => {
  /** @type {string[]} */
  const errors = [];

  if (!user || typeof user !== 'object') {
    errors.push('User is not an object');
    return errors;
  }

  if (!('_id' in user)) {
    errors.push("User object does not contain '_id' property");
    return errors;
  }

  const { _id } = user;
  if (typeof _id !== 'string' || !isMongoId(_id)) {
    errors.push(`User '_id' is not a valid MongoDB ID: '${_id}'`);
    return errors;
  }

  return errors;
};

module.exports = {
  validateReportId,
  validateMonth,
  validateYear,
  validateFileInfo,
  validateReportUser,
};
