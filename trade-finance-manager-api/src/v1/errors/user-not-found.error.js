/**
 * @class
 * @classdesc Class representing an error when a user is not found during a lookup.
 */
class UserNotFoundError extends Error {
  constructor({ message, cause = undefined }) {
    super(message, { cause });
    this.name = 'UserNotFoundError';
  }
}

module.exports = UserNotFoundError;
