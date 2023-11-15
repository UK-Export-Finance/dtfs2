const SignInLinkExpiredError = require('./sign-in-link-expired.error');

describe('SignInLinkExpiredError', () => {
  const message = 'an error message';

  it('exposes the message it was created with', () => {
    const exception = new SignInLinkExpiredError(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new SignInLinkExpiredError(message);

    expect(exception.name).toBe('SignInLinkExpiredError');
  });
});
