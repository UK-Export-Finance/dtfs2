import { FailedToSaveSignInTokenError } from './failed-to-save-sign-in-token.error';

describe('FailedToSaveSignInTokenError', () => {
  it('exposes the default message', () => {
    const exception = new FailedToSaveSignInTokenError();

    expect(exception.message).toBe('Failed to create sign in token');
  });

  it('exposes the name of the exception', () => {
    const exception = new FailedToSaveSignInTokenError();

    expect(exception.name).toBe('FailedToSaveSignInTokenError');
  });

  it('exposes the cause of the exception', () => {
    const errorCause = new Error('cause');
    const exception = new FailedToSaveSignInTokenError({ cause: errorCause });

    expect(exception.cause).toBe(errorCause);
  });
});
