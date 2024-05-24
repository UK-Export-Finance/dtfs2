import { FailedToSendSignInTokenError } from './failed-to-send-sign-in-token.error';

describe('FailedToSendSignInTokenError', () => {
  it('exposes the default message', () => {
    const exception = new FailedToSendSignInTokenError();

    expect(exception.message).toBe('Failed to send sign in token');
  });

  it('exposes the name of the exception', () => {
    const exception = new FailedToSendSignInTokenError();

    expect(exception.name).toBe('FailedToSendSignInTokenError');
  });

  it('exposes the cause of the exception', () => {
    const errorCause = new Error('cause');
    const exception = new FailedToSendSignInTokenError({ cause: errorCause });

    expect(exception.cause).toBe(errorCause);
  });
});
