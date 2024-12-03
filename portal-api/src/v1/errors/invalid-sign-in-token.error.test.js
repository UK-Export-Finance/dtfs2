const InvalidSignInToken = require('./invalid-sign-in-token.error');

describe('InvalidSignInToken', () => {
  const signInToken = 'exampleSignInToken';

  it('exposes the signInToken in a formatted message', () => {
    const exception = new InvalidSignInToken(signInToken);

    expect(exception.message).toEqual(`Invalid signInToken: ${signInToken}`);
  });

  it('exposes the name of the exception', () => {
    const exception = new InvalidSignInToken(signInToken);

    expect(exception.name).toEqual('InvalidSignInTokenError');
  });
});
