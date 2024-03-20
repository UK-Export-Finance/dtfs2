class FailedToDeleteBankError extends Error {
  constructor({ bankId, cause = undefined }) {
    const message = `Failed to delete bank: ${bankId}`;
    super(message, { cause });
    this.name = this.constructor.name;
  }
}

module.exports = FailedToDeleteBankError;
