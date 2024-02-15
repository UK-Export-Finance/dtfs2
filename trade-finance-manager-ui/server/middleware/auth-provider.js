const msal = require('@azure/msal-node');
const axios = require('axios');
const { msalConfig, TENANT_SUBDOMAIN, REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } = require('./auth-provider-config');

class AuthProvider {

  constructor(config) {
    this.config = config;
    this.cryptoProvider = new msal.CryptoProvider();
    this.msalConfig = msalConfig;
  }

  getMsalInstance() {
    return new msal.ConfidentialClientApplication(this.msalConfig);
  }

  async login(req, res, next) {
    // create a GUID for csrf
    req.session.csrfToken = this.cryptoProvider.createNewGuid();

    /**
     * The MSAL Node library allows you to pass your custom state as state parameter in the Request object.
     * The state parameter can also be used to encode information of the app's state before redirect.
     * You can pass the user's state in the app, such as the page or view they were on, as input to this parameter.
     */

    const state = this.cryptoProvider.base64Encode(
      JSON.stringify({
        csrfToken: req.session.csrfToken,
        redirectTo: '/',
      }),
    );

    const authCodeUrlRequestParams = {
      state,

      /**
       * By default, MSAL Node will add OIDC scopes to the auth code url request. For more information, visit:
       * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
       */
      scopes: [],
    };

    const authCodeRequestParams = {
      state,

      /**
       * By default, MSAL Node will add OIDC scopes to the auth code request. For more information, visit:
       * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
       */
      scopes: [],
    };

    /**
     * If the current msal configuration does not have cloudDiscoveryMetadata or authorityMetadata, we will
     * make a request to the relevant endpoints to retrieve the metadata. This allows MSAL to avoid making
     * metadata discovery calls, thereby improving performance of token acquisition process.
     */

    if (!this.config.msalConfig.auth.authorityMetadata) {
      const authorityMetadata = await this.getAuthorityMetadata();
      this.config.msalConfig.auth.authorityMetadata = JSON.stringify(authorityMetadata);
    }
    const msalInstance = this.getMsalInstance(this.config.msalConfig);

    // trigger the first leg of auth code flow
    return this.redirectToAuthCodeUrl(
      req,
      res,
      next,
      authCodeUrlRequestParams,
      authCodeRequestParams,
      msalInstance,
    );
  }

  /**
   * Prepares the auth code request parameters and initiates the first leg of auth code flow
   * @param req: Express request object
   * @param res: Express response object
   * @param next: Express next function
   * @param authCodeUrlRequestParams: parameters for requesting an auth code url
   * @param authCodeRequestParams: parameters for requesting tokens using auth code
   */
  async redirectToAuthCodeUrl(req, res, next, authCodeUrlRequestParams, authCodeRequestParams, msalInstance) {
    // Generate Proof Key of Code Exchange (PKCE) Codes before starting the authorization flow
    const { verifier, challenge } = await this.cryptoProvider.generatePkceCodes();
    // Set generated PKCE codes and method as session vars
    req.session.pkceCodes = {
      challengeMethod: 'S256',
      verifier,
      challenge,
    };
    /**
     * By manipulating the request objects below before each request, we can obtain
     * auth artifacts with desired claims. For more information, visit:
     * https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#authorizationurlrequest
     * https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#authorizationcoderequest
     * */
    req.session.authCodeUrlRequest = {
      ...authCodeUrlRequestParams,
      redirectUri: this.config.redirectUri,
      responseMode: 'form_post', // recommended for confidential clients
      codeChallenge: req.session.pkceCodes.challenge,
      codeChallengeMethod: req.session.pkceCodes.challengeMethod,
    };

    req.session.authCodeRequest = {
      ...authCodeRequestParams,
      redirectUri: this.config.redirectUri,
      code: '',
    };
    try {
      const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(req.session.authCodeUrlRequest);
      return res.redirect(authCodeUrlResponse);
    } catch (error) {
      next(error);
    }
    // TODO: eslint want's return, but not sure what is best return value if we don't need it.
    return null;
  }

  /**
   * handleRedirect original is from Microsoft example, but was modified to meet out minimal needs.
   * OpendId tokenResponse is enough for us (UKEF), it has all claims (aka fields) required for user data.
   * We don't save Authorisation code because we don't need Access token.
   * @param req: Express request object
   * @param res: Express response object
   * @param next: Express next function
   * @returns
   */
  async handleRedirect(req, res, next) {
    try {
      const authCodeRequest = {
        ...req.session.authCodeRequest,
        code: req.body.code, // authZ code
        codeVerifier: req.session.pkceCodes.verifier, // PKCE Code Verifier
      };

      const msalInstance = this.getMsalInstance(this.config.msalConfig);

      msalInstance.getTokenCache().deserialize(req.session.tokenCache);
      const tokenResponse = await msalInstance.acquireTokenByCode(authCodeRequest, req.body);

      return tokenResponse.account;
    } catch (error) {
      next(error);
    }
    return null;
  }

  redirectAfterLogin(rawState, res) {
    const state = JSON.parse(this.cryptoProvider.base64Decode(rawState));
    res.redirect(state.redirectTo);
  }

  /**
     *
     * @param req: Express request object
     * @param res: Express response object
     * @param next: Express next function
     */
  getLogoutUrl() {
    /**
     * Construct a logout URI and redirect the user to end the
     * session with Azure AD. For more information, visit:
     * https://docs.microsoft.com/azure/active-directory/develop/v2-protocols-oidc#send-a-sign-out-request
     */
    const logoutUri = `${this.config.msalConfig.auth.authority}${TENANT_SUBDOMAIN}.onmicrosoft.com/oauth2/v2.0/logout?post_logout_redirect_uri=${POST_LOGOUT_REDIRECT_URI}`;

    return logoutUri;
  }

  /**
   * Retrieves oidc metadata from the openid endpoint
   * @returns
   */
  async getAuthorityMetadata() {
    const endpoint = `${this.config.msalConfig.auth.authority}${TENANT_SUBDOMAIN}.onmicrosoft.com/v2.0/.well-known/openid-configuration`;
    try {
      const response = await axios.get(endpoint);
      return await response.data;
    } catch (error) {
      console.error('Error in getAuthorityMetadata', error);
    }
    return null;
  }
}

const authProvider = new AuthProvider({
  msalConfig,
  redirectUri: REDIRECT_URI,
  postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI,
});

module.exports = authProvider;
