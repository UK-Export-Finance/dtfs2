export class FailedToCreateSignInTokenError extends Error {
  constructor({ cause }: { cause?: unknown } = {}) {
    super('Failed to create sign in token', { cause });
    this.name = this.constructor.name;
  }
}
