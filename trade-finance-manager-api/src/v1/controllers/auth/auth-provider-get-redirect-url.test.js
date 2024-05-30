const AuthProvider = require('./auth-provider');

describe('AuthProvider - loginRedirectUrl', () => {
  it('should return a redirect URL', () => {
    const mockStr = 'mock-string';

    AuthProvider.cryptoProvider = {
      base64Decode: jest.fn(() => JSON.stringify({ redirectTo: '/mock-url' })),
    };

    const result = AuthProvider.loginRedirectUrl(mockStr);

    const expectedState = JSON.parse(AuthProvider.cryptoProvider.base64Decode(mockStr));

    const expected = expectedState.redirectTo;

    expect(result).toEqual(expected);
  });
});
