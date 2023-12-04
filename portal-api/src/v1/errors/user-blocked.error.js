class UserBlockedError extends Error {
  constructor(userId) {
    const message = `User blocked: ${userId}`;
    super(message);
    this.name = this.constructor.name;
  }
}

module.exports = UserBlockedError;
