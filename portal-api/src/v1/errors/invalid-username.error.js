class InvalidUsernameError extends Error {
  constructor(username) {
    const message = `Invalid username: ${username}`;
    super(message);
    this.name = this.constructor.name;
  }
}

module.exports = InvalidUsernameError;
