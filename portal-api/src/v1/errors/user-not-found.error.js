class UserNotFoundError extends Error {
  constructor({ userIdentifier, cause = undefined }) {
    const message = `Failed to find user: ${userIdentifier}`;
    super(message, { cause });
    this.name = this.constructor.name;
  }
}

module.exports = UserNotFoundError;
