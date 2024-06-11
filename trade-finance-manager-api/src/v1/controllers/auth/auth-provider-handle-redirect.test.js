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
      idTokenClaims: {},
    },
  };

  const mockMsalInstance = {
    acquireTokenByCode: jest.fn().mockResolvedValue(mockAcquireTokenByCodeResponse),
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

  describe('when msalInstance.acquireTokenByCode errors', () => {
    const mockError = 'mock acquireTokenByCode error message';

    const mockErrorMslInstance = {
      acquireTokenByCode: jest.fn().mockRejectedValue(mockError),
    };

    beforeAll(() => {
      AuthProvider.msalInstance = () => mockErrorMslInstance;
    });

    it('should throw an error', async () => {
      try {
        await AuthProvider.handleRedirect(mockPkceCode, mockOrigAuthCodeRequest, mockCode);
      } catch (error) {
        expect(String(error).includes(mockError)).toEqual(true);
      }
    });
  });

  describe('when msalInstance.acquireTokenByCode does not return an account with idTokenClaims', () => {
    const mockErrorMslInstance = {
      acquireTokenByCode: jest.fn().mockReturnValue({}),
    };

    beforeAll(() => {
      AuthProvider.msalInstance = () => mockErrorMslInstance;
    });

    it('should throw an error', async () => {
      try {
        await AuthProvider.handleRedirect(mockPkceCode, mockOrigAuthCodeRequest, mockCode);
      } catch (error) {
        const expectedError = 'TFM auth service - handleRedirect - Entra user missing token claims';

        expect(String(error).includes(expectedError)).toEqual(true);
      }
    });
  });
});
