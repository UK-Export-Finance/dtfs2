/**
 * @class
 * @classdesc Class representing an error when a user is not found during a lookup.
 */
class UserNotFoundError extends Error {
  constructor({ userIdentifier, cause = undefined }) {
    const message = `Failed to find user: ${userIdentifier}`;
    super(message, { cause });
    this.name = this.constructor.name;
  }
}

module.exports = UserNotFoundError;
