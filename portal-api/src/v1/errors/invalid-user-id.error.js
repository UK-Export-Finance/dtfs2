class InvalidUserIdError extends Error {
  constructor(userId) {
    const message = `Invalid user ID: ${userId}`;
    super(message);
    this.name = this.constructor.name;
  }
}

module.exports = InvalidUserIdError;
