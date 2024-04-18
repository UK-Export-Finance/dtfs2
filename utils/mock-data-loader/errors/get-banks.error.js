class FailedToGetBanksError extends Error {
  constructor({ cause = undefined }) {
    const message = 'Failed to get banks';
    super(message, { cause });
    this.name = this.constructor.name;
  }
}

module.exports = FailedToGetBanksError;
