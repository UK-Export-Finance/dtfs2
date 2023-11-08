const { InvalidDatabaseQueryError } = require('./invalid-database-query.error');
const InvalidEnvironmentVariableError = require('./invalid-environment-variable.error');
const InvalidUserIdError = require('./invalid-user-id.error');
const InvalidUsernameError = require('./invalid-username.error');
const UserNotFoundError = require('./user-not-found.error');

module.exports = {
  InvalidDatabaseQueryError: InvalidDatabaseQueryError,
  InvalidEnvironmentVariableError: InvalidEnvironmentVariableError,
  InvalidUserIdError: InvalidUserIdError,
  InvalidUsernameError: InvalidUsernameError,
  UserNotFoundError: UserNotFoundError,
};
