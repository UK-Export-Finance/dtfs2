class ApiError extends Error {
  constructor({ cause = undefined }) {
    const message = 'Failed to call API';
    super(message, { cause });
    this.name = this.constructor.name;
  }
}

module.exports = ApiError;
