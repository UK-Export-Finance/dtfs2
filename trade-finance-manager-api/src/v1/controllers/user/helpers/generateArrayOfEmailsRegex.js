const escapeStringRegexp = require('escape-string-regexp');

/**
 * regex
 * Email regex.
 * @param {String} email
 * @returns {Object} Regular expression
 */
const regex = (email) => new RegExp(`^${escapeStringRegexp(email)}$`, 'i');

/**
 * generateArrayOfEmailsRegex
 * Generate an array of emails as regular expressions.
 * This is used to find users with matching emails.
 * @param {Array} emails
 * @returns {Array} Emails as regular expressions.
 */
const generateArrayOfEmailsRegex = (emails) => {
  const mapped = emails.map(email => regex(email));

  return mapped;
};

module.exports = { generateArrayOfEmailsRegex };
