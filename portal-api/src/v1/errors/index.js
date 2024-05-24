const { InvalidDatabaseQueryError } = require('./invalid-database-query.error');
const InvalidSignInTokenError = require('./invalid-sign-in-token.error');
const InvalidUserIdError = require('./invalid-user-id.error');
const InvalidUsernameError = require('./invalid-username.error');
const InvalidSessionIdentifierError = require('./invalid-session-identifier.error');
const UserNotFoundError = require('./user-not-found.error');
const InvalidEmailAddressError = require('./invalid-email-address.error');
const { InvalidReportStatusError } = require('./invalid-report-status.error');

module.exports = {
  InvalidDatabaseQueryError,
  InvalidSignInTokenError,
  InvalidUserIdError,
  InvalidUsernameError,
  UserNotFoundError,
  InvalidSessionIdentifierError,
  InvalidEmailAddressError,
  InvalidReportStatusError,
};
