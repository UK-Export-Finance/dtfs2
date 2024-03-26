const AuthProvider = require('./auth-provider');
const { REDIRECT_URI } = require('./auth-provider-config');

describe('AuthProvider - getAuthCodeUrl', () => {
  const mockCsrfToken = 'mock-csrf';

  const mockAuthCodeUrlResponse = {
    loginUrl: 'mock-login-url',
    pkceCodes: {
      challengeMethod: 'S256',
      verifier: '',
      challenge: '',
    },
  };

  const mockGeneratePkceCodesResponse = {
    verifier: 'mockVerifier',
    challenge: 'mockChallenge',
  };

  const mockMsalInstance = {
    getAuthCodeUrl: jest.fn().mockResolvedValue(mockAuthCodeUrlResponse)
  };

  let result;

  const mockRequestParams = {
    scopes: [],
  };

  beforeAll(async () => {
    AuthProvider.cryptoProvider.generatePkceCodes = jest.fn().mockResolvedValue(mockGeneratePkceCodesResponse);

    result = await AuthProvider.getAuthCodeUrl({
      csrfToken: mockCsrfToken,
      authCodeUrlRequestParams: mockRequestParams,
      authCodeRequestParams: mockRequestParams,
      msalInstance: mockMsalInstance,
    });
  });

  it('should call AuthProvider.cryptoProvider.createNewGuid', () => {
    expect(AuthProvider.cryptoProvider.generatePkceCodes).toHaveBeenCalledTimes(1);
  });

  it('should call msalInstance.getAuthCodeUrl', () => {
    expect(mockMsalInstance.getAuthCodeUrl).toHaveBeenCalledTimes(1);
  });

  it('should return an object', async () => {
    const mockPkceCodes = {
      challengeMethod: 'S256',
      verifier: mockGeneratePkceCodesResponse.verifier,
      challenge: mockGeneratePkceCodesResponse.challenge,
    };

    const expectedLoginUrl = await mockMsalInstance.getAuthCodeUrl();

    const expected = {
      csrfToken: mockCsrfToken,
      pkceCodes: mockPkceCodes,
      authCodeUrlRequest: {
        ...mockRequestParams,
        redirectUri: REDIRECT_URI,
        responseMode: 'form_post',
        codeChallenge: mockPkceCodes.challenge,
        codeChallengeMethod: mockPkceCodes.challengeMethod,
      },
      authCodeRequest: {
        ...mockRequestParams,
        redirectUri: REDIRECT_URI,
        code: '',
      },
      loginUrl: expectedLoginUrl,
    };

    expect(result).toEqual(expected);
  });

  describe('when AuthProvider.cryptoProvider.generatePkceCodes errors', () => {
    beforeAll(() => {
      AuthProvider.cryptoProvider.generatePkceCodes = jest.fn().mockRejectedValue();
    });

    it('should throw an error', async () => {
      try {
        await AuthProvider.getAuthCodeUrl({
          csrfToken: mockCsrfToken,
          authCodeUrlRequestParams: mockRequestParams,
          authCodeRequestParams: mockRequestParams,
          msalInstance: mockMsalInstance,
        });
      } catch (error) {
        const expectedError = 'Error TFM auth service - getAuthCodeUrl';

        expect(String(error).includes(expectedError)).toEqual(true);
      }
    });
  });

  describe('when AuthProvider.cryptoProvider.generatePkceCodes errors', () => {
    const mockErrorMslInstance = {
      getAuthCodeUrl: jest.fn().mockRejectedValue(),
    };

    beforeAll(() => {
      AuthProvider.cryptoProvider.generatePkceCodes = jest.fn().mockResolvedValue(mockGeneratePkceCodesResponse);
    });

    it('should throw an error', async () => {
      try {
        await AuthProvider.getAuthCodeUrl({
          csrfToken: mockCsrfToken,
          authCodeUrlRequestParams: mockRequestParams,
          authCodeRequestParams: mockRequestParams,
          msalInstance: mockErrorMslInstance,
        });
      } catch (error) {
        const expectedError = 'Error TFM auth service - getAuthCodeUrl';

        expect(String(error).includes(expectedError)).toEqual(true);
      }
    });
  });
});
