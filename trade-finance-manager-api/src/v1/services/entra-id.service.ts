import { AuthorizationUrlRequest, ConfidentialClientApplication, Configuration as MsalAppConfig, CryptoProvider } from '@azure/msal-node';
import { EntraIdUser, DecodedAuthCodeRequestState, EntraIdAuthCodeRedirectResponseBody, GetAuthCodeUrlResponse } from '@ukef/dtfs2-common';
import { DECODED_AUTH_CODE_REQUEST_STATE_SCHEMA, ENTRA_ID_AUTHENTICATION_RESULT_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { EntraIdConfig } from '../configs/entra-id.config';
import { EntraIdApi } from '../third-party-apis/entra-id.api';

export type GetAuthCodeUrlParams = {
  successRedirect?: string;
};

type HandleRedirectParams = {
  authCodeResponse: EntraIdAuthCodeRedirectResponseBody;
  originalAuthCodeUrlRequest?: AuthorizationUrlRequest;
};

export type HandleRedirectResponse = {
  idTokenClaims: EntraIdUser;
  successRedirect?: string;
};

type GetAccessTokenAndEntraIdUserByAuthCodeParams = {
  authCodeResponse: EntraIdAuthCodeRedirectResponseBody;
  originalAuthCodeUrlRequest: AuthorizationUrlRequest;
};

type GetEntraIdUserByAuthCodeResponse = {
  idTokenClaims: EntraIdUser;
};

export class EntraIdService {
  private readonly msalConfig: MsalAppConfig;
  private readonly cryptoProvider = new CryptoProvider();
  private readonly entraIdConfig: EntraIdConfig;
  private readonly entraIdApi: EntraIdApi;

  constructor({ entraIdConfig, entraIdApi }: { entraIdConfig: EntraIdConfig; entraIdApi: EntraIdApi }) {
    this.entraIdConfig = entraIdConfig;
    this.entraIdApi = entraIdApi;
    this.msalConfig = entraIdConfig.msalConfig;
  }

  /**
   * Retrieves an instance of the `ConfidentialClientApplication` configured with
   * the necessary authority metadata to optimise performance. If the authority
   * metadata is not already cached in the `msalConfig`, it fetches the metadata
   * and stores it for future use.
   *
   * @returns {Promise<ConfidentialClientApplication>} A promise that resolves to
   * an instance of `ConfidentialClientApplication` configured with the cached
   * authority metadata.
   *
   * @remarks
   * This method improves performance by avoiding repeated metadata fetches on
   * every request. For more details, refer to the MSAL Node performance documentation:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/performance.md
   *
   * @throws {Error} If unable to get the MSAL application instance.
   */
  private async getMsalInstance(): Promise<ConfidentialClientApplication> {
    try {
      if (!this.msalConfig.auth.authorityMetadata) {
        const metaData = await this.entraIdApi.getAuthorityMetadataUrl();
        this.msalConfig.auth.authorityMetadata = JSON.stringify(metaData);
      }

      return new ConfidentialClientApplication(this.msalConfig);
    } catch (error) {
      console.error('Unable to get MSAL instance %o', error);
      throw error;
    }
  }

  /**
   * Generates an authorisation code URL for Entra ID authentication.
   *
   * This method creates a URL that can be used to initiate the OAuth 2.0
   * authorization code flow with Entra ID. It includes a CSRF token in the
   * state parameter to protect against CSRF attacks, and encodes the state
   * as a base64 string.
   *
   * @param {GetAuthCodeUrlParams} params - Parameters for generating the authorization code URL.
   * @returns {Promise<GetAuthCodeUrlResponse>} A promise that resolves with the authorization code URL
   * and the request details used to generate it.
   *
   * @throws {Error} If there is an issue creating the MSAL instance or generating the URL.
   *
   * @see {@link https://datatracker.ietf.org/doc/html/rfc6819#section-3.6} for details on CSRF protection.
   */
  public async getAuthCodeUrl({ successRedirect }: GetAuthCodeUrlParams): Promise<GetAuthCodeUrlResponse> {
    const msalApp = await this.getMsalInstance();

    const decodedState: DecodedAuthCodeRequestState = {
      csrfToken: this.cryptoProvider.createNewGuid(),
      successRedirect,
    };

    const authCodeUrlRequest: AuthorizationUrlRequest = {
      scopes: this.entraIdConfig.scopes,
      redirectUri: this.entraIdConfig.redirectUri,
      responseMode: 'form_post',
      state: this.cryptoProvider.base64Encode(JSON.stringify(decodedState)),
    };

    const authCodeUrl = await msalApp.getAuthCodeUrl(authCodeUrlRequest);

    return { authCodeUrl, authCodeUrlRequest };
  }

  /**
   * Parses an encoded authentication request state and validates it against the schema.
   *
   * @param encodedState - The Base64-encoded string representing the authentication request state.
   * @returns The decoded and validated authentication request state as a `DecodedAuthCodeRequestState` object.
   * @throws Will throw an error if the decoding or schema validation fails.
   */
  private parseAuthRequestState(encodedState: string): DecodedAuthCodeRequestState {
    try {
      return DECODED_AUTH_CODE_REQUEST_STATE_SCHEMA.parse(JSON.parse(this.cryptoProvider.base64Decode(encodedState)));
    } catch (error) {
      console.error('Error parsing auth request state: %o', error);
      throw error;
    }
  }

  /**
   * Handles the redirect process after an authentication attempt with Entra ID.
   *
   * @param {HandleRedirectParams} params - The parameters required for handling the redirect.
   * @param {AuthCodeResponse} params.authCodeResponse - The response containing the authentication code.
   * @param {AuthCodeUrlRequest} params.originalAuthCodeUrlRequest - The original authentication code URL request.
   *
   * @returns {Promise<HandleRedirectResponse>} A promise that resolves to an object containing the ID token claims
   * and the success redirect URL.
   *
   * @throws {Error} If the original authentication code URL request is not found in the session.
   */
  public async handleRedirect({ authCodeResponse, originalAuthCodeUrlRequest }: HandleRedirectParams): Promise<HandleRedirectResponse> {
    if (!originalAuthCodeUrlRequest) {
      throw new Error('No auth code URL request found in session');
    }

    const { idTokenClaims } = await this.getEntraIdUserByAuthCode({
      authCodeResponse,
      originalAuthCodeUrlRequest,
    });

    const { successRedirect } = this.parseAuthRequestState(authCodeResponse.state);

    return {
      idTokenClaims,
      successRedirect,
    };
  }

  /**
   * Retrieves an Entra ID user by exchanging an authorization code for an access token.
   * This method ensures the security of the process by validating the state in the
   * original authorization code request against the state in the received authorization
   * code response, protecting against CSRF attacks.
   *
   * @param params - An object containing the authorization code response and the original
   *                 authorization code URL request.
   * @param params.authCodeResponse - The response containing the authorization code
   *                                  received via the redirect.
   * @param params.originalAuthCodeUrlRequest - The original authorization code URL request
   *                                            used to initiate the authentication process.
   *
   * @returns A promise that resolves to an object containing the ID token claims of the
   *          authenticated user.
   *
   * @throws Will throw an error if an invalid SSO token is received.
   *
   * @see {@link https://datatracker.ietf.org/doc/html/rfc6819#section-3.6} for details on
   *      CSRF attack prevention.
   */
  private async getEntraIdUserByAuthCode({
    authCodeResponse,
    originalAuthCodeUrlRequest,
  }: GetAccessTokenAndEntraIdUserByAuthCodeParams): Promise<GetEntraIdUserByAuthCodeResponse> {
    try {
      const msalApp = await this.getMsalInstance();
      const originalUrlRequest = originalAuthCodeUrlRequest;
      const { code } = authCodeResponse;
      const tokenRequest = { ...originalUrlRequest, code };
      const token = await msalApp.acquireTokenByCode(tokenRequest, authCodeResponse);

      if (!token) {
        console.error('Unable to get Entra ID from authentication code %o', token);
        throw new Error('Unable to get Entra ID from authentication code');
      }

      const {
        account: { idTokenClaims },
      } = ENTRA_ID_AUTHENTICATION_RESULT_SCHEMA.parse(token);

      return { idTokenClaims };
    } catch (error) {
      console.error('Error getting Entra ID by authentication code %o', error);
      throw error;
    }
  }
}
