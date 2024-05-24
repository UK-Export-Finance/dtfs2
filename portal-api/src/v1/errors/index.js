const { InvalidDatabaseQueryError } = require('./invalid-database-query.error');
const InvalidEnvironmentVariableError = require('./invalid-environment-variable.error');
const InvalidSignInTokenError = require('./invalid-sign-in-token.error');
const InvalidUserIdError = require('./invalid-user-id.error');
const InvalidUsernameError = require('./invalid-username.error');
const InvalidSessionIdentifierError = require('./invalid-session-identifier.error');
const UserBlockedError = require('./user-blocked.error');
const UserDisabledError = require('./user-disabled.error');
const UserNotFoundError = require('./user-not-found.error');
const InvalidEmailAddressError = require('./invalid-email-address.error');
const { InvalidReportStatusError } = require('./invalid-report-status.error');
const { FailedToCreateSignInTokenError } = require('./failed-to-create-sign-in-token.error');
const { FailedToSaveSignInTokenError } = require('./failed-to-save-sign-in-token.error');
const { FailedToSendSignInTokenError } = require('./failed-to-send-sign-in-token.error');

module.exports = {
  InvalidDatabaseQueryError,
  InvalidEnvironmentVariableError,
  InvalidSignInTokenError,
  InvalidUserIdError,
  InvalidUsernameError,
  UserNotFoundError,
  UserBlockedError,
  UserDisabledError,
  InvalidSessionIdentifierError,
  InvalidEmailAddressError,
  InvalidReportStatusError,
  FailedToCreateSignInTokenError,
  FailedToSaveSignInTokenError,
  FailedToSendSignInTokenError,
};
