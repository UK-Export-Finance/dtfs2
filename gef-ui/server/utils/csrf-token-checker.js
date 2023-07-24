const { isBefore } = require('date-fns');

const isCsrfTokenValid = (receivedCsrfToken, storedCsrfToken) =>
  storedCsrfToken && storedCsrfToken.token === receivedCsrfToken && isBefore(new Date(), new Date(storedCsrfToken.expiry));

module.exports = {
  isCsrfTokenValid,
};
