const AuthProvider = require('./auth-provider');
const { msalConfig, AZURE_SSO_TENANT_SUBDOMAIN, AZURE_SSO_POST_LOGOUT_URI } = require('./auth-provider-config');

describe('AuthProvider - getLogoutUrl', () => {
  it('should return a redirect URL', () => {
    const result = AuthProvider.getLogoutUrl();

    const expectedAuthority = msalConfig.auth.authority;

    const expected = `${expectedAuthority}${AZURE_SSO_TENANT_SUBDOMAIN}.onmicrosoft.com/oauth2/v2.0/logout?post_logout_redirect_uri=${AZURE_SSO_POST_LOGOUT_URI}`;

    expect(result).toEqual(expected);
  });
});
