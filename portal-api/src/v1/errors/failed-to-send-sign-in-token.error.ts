export class FailedToSendSignInTokenError extends Error {
  constructor({ cause }: { cause?: unknown } = {}) {
    super('Failed to send sign in token', { cause });
    this.name = this.constructor.name;
  }
}
