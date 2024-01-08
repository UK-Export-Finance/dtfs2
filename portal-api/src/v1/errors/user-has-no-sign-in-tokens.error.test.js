const UserHasNoSignInTokensError = require('./user-has-no-sign-in-tokens.error');

describe('UserHasNoSignInTokensError', () => {
  const userIdentifier = 'exampleIdOrName';

  it('exposes the userIdentifier in a formatted message', () => {
    const exception = new UserHasNoSignInTokensError({ userIdentifier });

    expect(exception.message).toBe(`Failed to find sign in tokens for user: ${userIdentifier}`);
  });

  it('exposes the name of the exception', () => {
    const exception = new UserHasNoSignInTokensError({ userIdentifier });

    expect(exception.name).toBe('UserHasNoSignInTokensError');
  });

  it('exposes the cause if a cause is provided', () => {
    const cause = 'exampleCause';
    const exception = new UserHasNoSignInTokensError({ userIdentifier, cause });

    expect(exception.cause).toBe(cause);
  });

  it('does not expose a cause if a cause is not provided', () => {
    const exception = new UserHasNoSignInTokensError({ userIdentifier });

    expect(exception.cause).toBeUndefined();
  });
});
