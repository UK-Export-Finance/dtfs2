class FailedToCreateUserError extends Error {
  constructor({ username, cause = undefined }) {
    const message = `Failed to create user: ${username}`;
    super(message, { cause });
    this.name = this.constructor.name;
  }
}

module.exports = FailedToCreateUserError;
