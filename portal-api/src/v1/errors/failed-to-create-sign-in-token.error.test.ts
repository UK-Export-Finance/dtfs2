import { FailedToCreateSignInTokenError } from './failed-to-create-sign-in-token.error';

describe('FailedToCreateSignInTokenError', () => {
  it('exposes the default message', () => {
    const exception = new FailedToCreateSignInTokenError();

    expect(exception.message).toBe('Failed to create sign in token');
  });

  it('exposes the name of the exception', () => {
    const exception = new FailedToCreateSignInTokenError();

    expect(exception.name).toBe('FailedToCreateSignInTokenError');
  });

  it('exposes the cause of the exception', () => {
    const errorCause = new Error('cause');
    const exception = new FailedToCreateSignInTokenError({ cause: errorCause });

    expect(exception.cause).toBe(errorCause);
  });
});
