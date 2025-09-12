class InvalidSignInTokenError extends Error {
  constructor(signInToken) {
    const message = `Invalid signInToken: ${signInToken}`;
    super(message);
    this.name = this.constructor.name;
  }
}

module.exports = InvalidSignInTokenError;
