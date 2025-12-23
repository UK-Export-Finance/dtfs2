class InvalidSignInOTPError extends Error {
  constructor(otpCode) {
    const message = `Invalid signInOTP: ${otpCode}`;
    super(message);
    this.name = this.constructor.name;
  }
}

module.exports = InvalidSignInOTPError;
