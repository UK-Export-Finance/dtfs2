const { isBefore } = require('date-fns');

/**
 * Checks that the received CSRF token matches token saved in session.
 * It expects just the token from the received CSRF token.
 * It expects stored token as an object with the token and expiry date.
 * If the token is valid move to the next middleware
 * If it is invalid return an error response
 * @param {string} receivedCsrfToken
 * @param {Object} storedCsrfToken
 * @param {Function} next
 */
const isCsrfTokenValid = (receivedCsrfToken, storedCsrfToken) =>
  storedCsrfToken && storedCsrfToken.token === receivedCsrfToken && isBefore(new Date(), new Date(storedCsrfToken.expiry));

module.exports = {
  isCsrfTokenValid,
};
