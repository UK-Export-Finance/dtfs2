/**
 * @class
 * @classdesc Class representing an error when a user is disabled.
 */
class UserDisabledError extends Error {
  constructor(userId) {
    const message = `User disabled: ${userId}`;
    super(message);
    this.name = this.constructor.name;
  }
}

module.exports = UserDisabledError;
