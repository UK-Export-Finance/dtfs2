const axios = require('axios');
const AuthProvider = require('./auth-provider');
const { msalConfig, AZURE_SSO_TENANT_SUBDOMAIN } = require('./auth-provider-config');

describe('AuthProvider - getAuthorityMetadata', () => {
  let result;

  const mockAxiosResponse = {
    data: 'Mock response from Microsoft'
  };

  beforeAll(async () => {
    axios.get = jest.fn().mockResolvedValue(mockAxiosResponse);

    result = await AuthProvider.getAuthorityMetadata();
  });

  it('should call axios.get', () => {
    expect(axios.get).toHaveBeenCalledTimes(1);

    const expectedAuthority = msalConfig.auth.authority;

    const expected =
    `${expectedAuthority}${AZURE_SSO_TENANT_SUBDOMAIN}.onmicrosoft.com/v2.0/.well-known/openid-configuration`;

    expect(axios.get).toHaveBeenCalledWith(expected);
  });

  it('should return the response from axios/microsoft', () => {

    expect(axios.get).toHaveBeenCalled()

    expect(result).toEqual(mockAxiosResponse.data);
  });
});
