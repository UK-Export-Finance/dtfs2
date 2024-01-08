class UserHasNoSignInTokensError extends Error {
  constructor({ userIdentifier, cause = undefined }) {
    const message = `Failed to find sign in tokens for user: ${userIdentifier}`;
    super(message, { cause });
    this.name = this.constructor.name;
  }
}

module.exports = UserHasNoSignInTokensError;
