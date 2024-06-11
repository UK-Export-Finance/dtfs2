const axios = require('axios');
const AuthProvider = require('./auth-provider');
const { msalConfig, AZURE_SSO_TENANT_SUBDOMAIN } = require('./auth-provider-config');

describe('AuthProvider - getAuthorityMetadata', () => {
  const mockAxiosResponse = {
    data: 'Mock response from Microsoft',
  };

  beforeAll(() => {
    axios.get = jest.fn().mockResolvedValue(mockAxiosResponse);
  });

  it('should call axios.get', async () => {
    await AuthProvider.getAuthorityMetadata();

    expect(axios.get).toHaveBeenCalledTimes(1);

    const expectedAuthority = msalConfig.auth.authority;

    const expected = `${expectedAuthority}${AZURE_SSO_TENANT_SUBDOMAIN}.onmicrosoft.com/v2.0/.well-known/openid-configuration`;

    expect(axios.get).toHaveBeenCalledWith(expected);
  });

  it('should return the response from axios/microsoft', async () => {
    const result = await AuthProvider.getAuthorityMetadata();

    expect(axios.get).toHaveBeenCalled();

    expect(result).toEqual(mockAxiosResponse.data);
  });

  describe('when the axios call fails', () => {
    it('should thrown an error', async () => {
      axios.get = jest.fn().mockRejectedValue();

      try {
        await AuthProvider.getAuthorityMetadata();
      } catch (error) {
        const expectedError = 'Error TFM auth service - getting getAuthorityMetadata';

        expect(String(error).includes(expectedError)).toEqual(true);
      }
    });
  });
});
