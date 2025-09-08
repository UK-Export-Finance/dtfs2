class InvalidEmailAddressError extends Error {
  constructor(email) {
    const message = `Invalid email address: ${email}`;
    super(message);
    this.name = this.constructor.name;
  }
}

module.exports = InvalidEmailAddressError;
