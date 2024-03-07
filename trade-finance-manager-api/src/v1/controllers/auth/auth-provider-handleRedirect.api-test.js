const AuthProvider = require('./auth-provider');

describe('AuthProvider - handleRedirect', () => {
  let result;

  const mockOrigAuthCodeRequest = {
    mockOriginalRequest: true,
  };

  const mockCode = 'mock-authz-code';

  const mockPkceCode = {
    verifier: 'mock-verifier',
  };

  const mockAcquireTokenByCodeResponse = {
    account: {
      idTokenClaims: [],
    },
  };

  const mockMsalInstance = {
    acquireTokenByCode: jest.fn().mockResolvedValue(mockAcquireTokenByCodeResponse)
  };

  beforeAll(async () => {
    AuthProvider.getMsalInstance = () => mockMsalInstance;

    result = await AuthProvider.handleRedirect(mockPkceCode, mockOrigAuthCodeRequest, mockCode);
  });

  it('should call msalInstance.acquireTokenByCode', () => {
    expect(mockMsalInstance.acquireTokenByCode).toHaveBeenCalledTimes(1);
    expect(mockMsalInstance.acquireTokenByCode).toHaveBeenCalledWith({
      ...mockOrigAuthCodeRequest,
      code: mockCode,
      codeVerifier: mockPkceCode.verifier,
    });
  });

  it('should return the retrieved account', () => {
    expect(result).toEqual(mockAcquireTokenByCodeResponse.account);
  });
});
