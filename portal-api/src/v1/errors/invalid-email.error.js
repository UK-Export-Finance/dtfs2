class InvalidEmailError extends Error {
  constructor(email) {
    const message = `Invalid email: ${email}`;
    super(message);
    this.name = this.constructor.name;
  }
}

module.exports = InvalidEmailError;
