const msal = require('@azure/msal-node');
const axios = require('axios');
const { msalConfig, AZURE_SSO_TENANT_SUBDOMAIN, REDIRECT_URI, AZURE_SSO_POST_LOGOUT_URI } = require('./auth-provider-config');

class AuthProvider {
  constructor(config) {
    this.config = config;
    this.cryptoProvider = new msal.CryptoProvider();
    this.msalConfig = msalConfig;
  }

  /**
   * MS Auth layer client setup.
   * @return {object} MS Auth layer client application.
   */
  getMsalInstance() {
    return new msal.ConfidentialClientApplication(this.msalConfig);
  }

  /**
   * Starts login url setup, for first leg of auth code flow
   * @param {boolean} [skipAuthorityMetadataCache=false] Flag to avoid cache, used mostly for testing
   * @return {Promise<object>} PKCE codes, auth code request, login URL.
   */
  async getLoginUrl({ skipAuthorityMetadataCache = false } = {}) {
    // create a GUID for csrf
    const csrfToken = this.cryptoProvider.createNewGuid();

    /**
     * The MSAL Node library allows you to pass your custom state as state parameter in the Request object.
     * The state parameter can also be used to encode information of the app's state before redirect.
     * You can pass the user's state in the app, such as the page or view they were on, as input to this parameter.
     */
    const state = this.cryptoProvider.base64Encode(
      JSON.stringify({
        csrfToken,
        redirectTo: '/',
      }),
    );

    /**
     * Do not allow any scopes, e.g read/write calendars, send emails as the user etc.
     * By default, MSAL Node will add OIDC scopes to the auth code url request. For more information, visit:
     * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
     */
    const requestParams = {
      state,
      scopes: [],
    };

    const authCodeUrlRequestParams = requestParams;
    const authCodeRequestParams = requestParams;

    /**
     * If the current MSAL configuration does not have cloudDiscoveryMetadata or authorityMetadata, we will
     * make a request to the relevant endpoints to retrieve the metadata. This allows MSAL to avoid making
     * metadata discovery calls, thereby improving performance of token acquisition process.
     */
    if (!this.config.msalConfig.auth.authorityMetadata || skipAuthorityMetadataCache === true) {
      const authorityMetadata = await this.getAuthorityMetadata();
      this.config.msalConfig.auth.authorityMetadata = JSON.stringify(authorityMetadata);
    }

    const msalInstance = this.getMsalInstance(this.config.msalConfig);

    // trigger the first leg of auth code flow
    return this.getAuthCodeUrl({
      csrfToken,
      authCodeUrlRequestParams,
      authCodeRequestParams,
      msalInstance,
    });
  }

  /**
   * Prepares the auth code request parameters and initiates the first leg of auth code flow
   * @param {string} csrfToken: CSRF token
   * @param {object} authCodeUrlRequestParams: Parameters for requesting an auth code url
   * @param {object} authCodeRequestParams: Parameters for requesting tokens using auth code
   * @param {object} msalInstance: MSAL instance
   * @return {Promise<object>} PKCE codes, auth code request, login URL.
   */
  async getAuthCodeUrl({ csrfToken, authCodeUrlRequestParams, authCodeRequestParams, msalInstance }) {
    try {
      console.info('TFM auth service - getAuthCodeUrl');

      /**
       * Generate Proof Key of Code Exchange (PKCE) Codes,
       * before starting the authorization flow.
       */
      const { verifier, challenge } = await this.cryptoProvider.generatePkceCodes();

      /**
       * Create a response object with:
       * - CSRF token
       * - Generated PKCE codes
       * - Verifier
       * - Challenge
       */
      let response = {
        csrfToken,
        pkceCodes: {
          challengeMethod: 'S256',
          verifier,
          challenge,
        },
      };

      /**
       * By manipulating the request objects below before each request, we can obtain
       * auth artifacts with desired claims. For more information, visit:
       * https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#authorizationurlrequest
       * https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#authorizationcoderequest
       *
       */
      response = {
        ...response,
        authCodeUrlRequest: {
          ...authCodeUrlRequestParams,
          redirectUri: this.config.redirectUri,
          responseMode: 'form_post', // recommended for confidential clients
          codeChallenge: response.pkceCodes.challenge,
          codeChallengeMethod: response.pkceCodes.challengeMethod,
        },
        authCodeRequest: {
          ...authCodeRequestParams,
          redirectUri: this.config.redirectUri,
          code: '',
        },
      };

      response.loginUrl = await msalInstance.getAuthCodeUrl(response.authCodeUrlRequest);

      return response;
    } catch (error) {
      console.error('Error TFM auth service - getAuthCodeUrl %s', error);

      throw new Error('Error TFM auth service - getAuthCodeUrl %s', error);
    }
  }

  /**
   * handleRedirect
   * Modified Microsoft example, to meet out minimal needs.
   * OpendId tokenResponse is enough for us (UKEF), it has all claims (aka fields) required for user data.
   * We don't save Authorisation code because we don't need an access token.
   * @param {object} pkceCode: PKCE Code object
   * @param {object} origAuthCodeRequest: Original auth code request
   * @param {string} code: authZ code
   * @param {object} req: Request object
   * @returns {Promise<object>}
   */
  async handleRedirect(pkceCode, origAuthCodeRequest, code) {
    try {
      console.info('TFM auth service - handleRedirect');

      const authCodeRequest = {
        ...origAuthCodeRequest,
        code,
        codeVerifier: pkceCode.verifier,
      };

      const msalInstance = this.getMsalInstance(this.config.msalConfig);

      /** @constant {import('src/types/auth/azure-user-info-response').AzureUserInfoResponse} Entra Response */
      const tokenResponse = await msalInstance.acquireTokenByCode(authCodeRequest);

      const { account } = tokenResponse;

      if (!account?.idTokenClaims) {
        throw new Error('TFM auth service - handleRedirect - Entra user missing token claims: %O', account);
      }

      return tokenResponse.account;
    } catch (error) {
      console.error('Error TFM auth service - handleRedirect %s', error);

      throw new Error('Error TFM auth service - handleRedirect %s', error);
    }
  }

  /**
   * getLoginRedirectUrlFromState
   * Get a redirect URL to use after logging in.
   * @param {import('src/types/auth/msal-state-unparsed').MsalStateUnparsed} state This string is a base64 encoded JSON object, that should contain a redirectTo url
   * @returns {string} Redirect URL.
   */
  getLoginRedirectUrlFromState(state) {
    const { redirectTo } = JSON.parse(this.cryptoProvider.base64Decode(state));

    return redirectTo;
  }

  /**
   * getLogoutUrl
   * Get a logout URL.
   * @param req: Express request object
   * @param res: Express response object
   * @param next: Express next function
   * @return {string} Log out URL
   */
  getLogoutUrl() {
    /**
     * Construct a logout URI and redirect the user to end the
     * session with Azure AD. For more information, visit:
     * https://docs.microsoft.com/azure/active-directory/develop/v2-protocols-oidc#send-a-sign-out-request
     */
    return `${this.config.msalConfig.auth.authority}${AZURE_SSO_TENANT_SUBDOMAIN}.onmicrosoft.com/oauth2/v2.0/logout?post_logout_redirect_uri=${AZURE_SSO_POST_LOGOUT_URI}`;
  }

  /**
   * getAuthorityMetadata
   * Retrieves OIDC metadata from the openid endpoint
   * @returns {Promise<object>} OIDC metadata
   */
  async getAuthorityMetadata() {
    try {
      console.info('TFM auth service - getting getAuthorityMetadata');

      const endpoint = `${this.config.msalConfig.auth.authority}${AZURE_SSO_TENANT_SUBDOMAIN}.onmicrosoft.com/v2.0/.well-known/openid-configuration`;

      const response = await axios.get(endpoint);

      return response.data;
    } catch (error) {
      console.error('Error TFM auth service - getting getAuthorityMetadata %s', error);

      throw new Error('Error TFM auth service - getting getAuthorityMetadata %s', error);
    }
  }
}

const authProvider = new AuthProvider({
  msalConfig,
  redirectUri: REDIRECT_URI,
  postLogoutRedirectUri: AZURE_SSO_POST_LOGOUT_URI,
});

module.exports = authProvider;
