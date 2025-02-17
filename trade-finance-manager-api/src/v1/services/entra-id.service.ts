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
  entraIdUser: EntraIdUser;
  successRedirect?: string;
};

type GetAccessTokenAndEntraIdUserByAuthCodeParams = {
  authCodeResponse: EntraIdAuthCodeRedirectResponseBody;
  originalAuthCodeUrlRequest: AuthorizationUrlRequest;
};

type GetEntraIdUserByAuthCodeResponse = {
  entraIdUser: EntraIdUser;
};

export class EntraIdService {
  private readonly msalAppConfig: MsalAppConfig;

  private readonly cryptoProvider = new CryptoProvider();
  private readonly entraIdConfig: EntraIdConfig;
  private readonly entraIdApi: EntraIdApi;
  constructor({ entraIdConfig, entraIdApi }: { entraIdConfig: EntraIdConfig; entraIdApi: EntraIdApi }) {
    this.entraIdConfig = entraIdConfig;
    this.entraIdApi = entraIdApi;
    this.msalAppConfig = entraIdConfig.msalAppConfig;
  }

  /**
   * Used as part of the SSO process
   *
   * Creates the URL to redirect the user to Entra to login
   *
   * The redirect URI is retrieved from Entra later in the process, following a successful login, to allow
   * the user to be redirected to the original page they were visiting.
   */
  public async getAuthCodeUrl({ successRedirect }: GetAuthCodeUrlParams): Promise<GetAuthCodeUrlResponse> {
    const msalApp = await this.getMsalAppInstance();

    const decodedState: DecodedAuthCodeRequestState = {
      // Include a random CSRF token in the state parameter to protect against
      // CSRF attacks. The state will be cached in session then verified when
      // the response is received back via the redirect from Entra ID.
      // See https://datatracker.ietf.org/doc/html/rfc6819#section-3.6 for details
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
   * Used as part of the SSO process
   *
   * Handles the TFM-API side of the Entra communications following the automatic redirect from TFM UI.
   * This includes validating the auth code, and getting the entra user details
   */
  public async handleRedirect({ authCodeResponse, originalAuthCodeUrlRequest }: HandleRedirectParams): Promise<HandleRedirectResponse> {
    if (!originalAuthCodeUrlRequest) {
      throw new Error('No auth code URL request found in session');
    }

    const { entraIdUser } = await this.getEntraIdUserByAuthCode({
      authCodeResponse,
      originalAuthCodeUrlRequest,
    });

    const { successRedirect } = this.parseAuthRequestState(authCodeResponse.state);

    return {
      entraIdUser,
      successRedirect,
    };
  }

  /**
   * Parses the base 64 encoded auth code request into a known type
   */
  private parseAuthRequestState(encodedState: string): DecodedAuthCodeRequestState {
    try {
      return DECODED_AUTH_CODE_REQUEST_STATE_SCHEMA.parse(JSON.parse(this.cryptoProvider.base64Decode(encodedState)));
    } catch (error) {
      console.error('Error parsing auth request state: %o', error);
      throw error;
    }
  }

  private async getAuthorityMetadata() {
    try {
      return await this.entraIdApi.getAuthorityMetadataUrl();
    } catch (error) {
      console.error('Error fetching Entra ID authority metadata: %o', error);
      throw error;
    }
  }

  private async getMsalAppInstance(): Promise<ConfidentialClientApplication> {
    // Improve performance by fetching the authority metadata once and storing
    // in our cached `msalAppConfig` rather than fetching on every request.
    // https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/performance.md
    if (!this.msalAppConfig.auth.authorityMetadata) {
      this.msalAppConfig.auth.authorityMetadata = JSON.stringify(await this.getAuthorityMetadata());
    }

    return new ConfidentialClientApplication(this.msalAppConfig);
  }

  /**
   * Used as part of the SSO process
   *
   * Gets entra user details from the auth code response. Includes methods to ensure that the auth code response sent by
   * the client has not been modified through using a sever side original auth code request.
   */
  private async getEntraIdUserByAuthCode({
    authCodeResponse,
    originalAuthCodeUrlRequest,
  }: GetAccessTokenAndEntraIdUserByAuthCodeParams): Promise<GetEntraIdUserByAuthCodeResponse> {
    const msalApp = await this.getMsalAppInstance();

    // The token request uses details from our original auth code request so
    // that MSAL can validate that the state in our original request matches the
    // state in the auth code response received via the redirect. This ensures
    // that the originator of the request and the response received are the
    // same, which is important for security reasons to protect against CSRF
    // attacks.
    // See https://datatracker.ietf.org/doc/html/rfc6819#section-3.6 for details
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { responseMode, ...rest } = originalAuthCodeUrlRequest;
    const tokenRequest = { ...rest, code: authCodeResponse.code };
    const token = await msalApp.acquireTokenByCode(tokenRequest, authCodeResponse);
    const {
      account: { idTokenClaims },
    } = ENTRA_ID_AUTHENTICATION_RESULT_SCHEMA.parse(token);
    return { entraIdUser: idTokenClaims };
  }
}
