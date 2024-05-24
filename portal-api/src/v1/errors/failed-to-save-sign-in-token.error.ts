export class FailedToSaveSignInTokenError extends Error {
  constructor({ cause }: { cause?: unknown } = {}) {
    super('Failed to save sign in token', { cause });
    this.name = this.constructor.name;
  }
}
