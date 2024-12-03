class FailedToCreateLoggedInUserSessionError extends Error {
  constructor({ username, cause = undefined }) {
    const message = `Failed to create logged in user session for user: ${username}`;
    super(message, { cause });
    this.name = this.constructor.name;
  }
}

module.exports = FailedToCreateLoggedInUserSessionError;
