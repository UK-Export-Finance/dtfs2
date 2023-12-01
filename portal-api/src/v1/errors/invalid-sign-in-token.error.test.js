const InvalidSignInToken = require('./invalid-sign-in-token.error');

describe('InvalidSignInToken', () => {
  const userId = 'exampleId';

  it('exposes the userId in a formatted message', () => {
    const exception = new InvalidSignInToken(userId);

    expect(exception.message).toBe(`Invalid sign in token for user ID: ${userId}`);
  });

  it('exposes the name of the exception', () => {
    const exception = new InvalidSignInToken(userId);

    expect(exception.name).toBe('InvalidSignInTokenError');
  });
});
