const AuthProvider = require('./auth-provider');

describe('AuthProvider - getLoginUrl', () => {
  const mockCsrfToken = 'mock-csrf';

  const mockAuthCodeUrlResponse = {
    loginUrl: 'mock-login-url',
    pkceCodes: {
      challengeMethod: 'S256',
      verifier: '',
      challenge: '',
    },
  };

  const mockMsalInstance = {
    getAuthCodeUrl: jest.fn().mockResolvedValue(mockAuthCodeUrlResponse)
  };

  let result;

  const mockState = { mockState: true };
  const mockAuthorityMetadata = { mockMetadata: true };

  const expectedGetAuthCodeUrlParams = {
    csrfToken: mockCsrfToken,
    authCodeUrlRequestParams: {
      state: mockState,
      scopes: [],
    },
    authCodeRequestParams: {
      state: mockState,
      scopes: [],
    },
    msalInstance: mockMsalInstance,
  };

  beforeAll(async () => {
    AuthProvider.getMsalInstance = jest.fn(() => mockMsalInstance);
    AuthProvider.cryptoProvider.createNewGuid = jest.fn(() => mockCsrfToken);
    AuthProvider.cryptoProvider.base64Encode = jest.fn(() => mockState);
    AuthProvider.getAuthorityMetadata = jest.fn().mockResolvedValue(mockAuthorityMetadata);
    AuthProvider.getAuthCodeUrl = jest.fn().mockResolvedValue(mockAuthCodeUrlResponse);

    result = await AuthProvider.getLoginUrl();
  });

  it('should call AuthProvider.cryptoProvider.createNewGuid', () => {
    expect(AuthProvider.cryptoProvider.createNewGuid).toHaveBeenCalledTimes(1);
  });

  it('should call AuthProvider.cryptoProvider.base64Encode', () => {
    expect(AuthProvider.cryptoProvider.base64Encode).toHaveBeenCalledTimes(1);
    expect(AuthProvider.cryptoProvider.base64Encode).toHaveBeenCalledWith(
      JSON.stringify({
        csrfToken: mockCsrfToken,
        redirectTo: '/',
      }),
    );
  });

  it('should call AuthProvider.getAuthorityMetadata', () => {
    expect(AuthProvider.getAuthorityMetadata).toHaveBeenCalledTimes(1);
  });

  it('should call AuthProvider.getAuthCodeUrl', () => {
    expect(AuthProvider.getAuthCodeUrl).toHaveBeenCalledTimes(1);
    expect(AuthProvider.getAuthCodeUrl).toHaveBeenCalledWith(expectedGetAuthCodeUrlParams);
  });

  it('should return the result of getAuthCodeUrl', async () => {
    const expected = await AuthProvider.getAuthCodeUrl(expectedGetAuthCodeUrlParams);

    expect(result).toEqual(expected);
  });
});
