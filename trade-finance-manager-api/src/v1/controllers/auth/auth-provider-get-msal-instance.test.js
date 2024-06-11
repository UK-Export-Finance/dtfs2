const msal = require('@azure/msal-node');
const AuthProvider = require('./auth-provider');
const { msalConfig } = require('./auth-provider-config');

describe('AuthProvider - getMsalInstance', () => {
  it('should return an MSAL instance', () => {
    const result = AuthProvider.getMsalInstance();

    const expected = JSON.stringify(new msal.ConfidentialClientApplication(msalConfig));

    expect(JSON.stringify(result)).toEqual(expected);
  });
});
