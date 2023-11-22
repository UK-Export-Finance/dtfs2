class InvalidSignInTokenError extends Error {
  constructor(userId) {
    const message = `Invalid sign in token for user ID: ${userId}`;
    super(message);
    this.name = this.constructor.name;
  }
}

module.exports = InvalidSignInTokenError;
