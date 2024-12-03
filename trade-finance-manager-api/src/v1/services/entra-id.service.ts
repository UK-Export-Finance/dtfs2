import { AuthorizationUrlRequest, ConfidentialClientApplication, Configuration as MsalAppConfig, CryptoProvider } from '@azure/msal-node';
import { EntraIdUser, DecodedAuthCodeRequestState, EntraIdAuthCodeRedirectResponseBody } from '@ukef/dtfs2-common';
import { DECODED_AUTH_CODE_REQUEST_STATE_SCHEMA, ENTRA_ID_AUTHENTICATION_RESULT_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { EntraIdConfig } from '../configs/entra-id.config';
import { EntraIdApi } from '../third-party-apis/entra-id.api';

type GetAuthCodeUrlParams = {
  successRedirect?: string;
};

type GetAuthCodeUrlResponse = {
  authCodeUrl: string;
  authCodeUrlRequest: AuthorizationUrlRequest;
};

type HandleRedirectParams = {
  authCodeResponse: EntraIdAuthCodeRedirectResponseBody;
  originalAuthCodeUrlRequest?: AuthorizationUrlRequest;
};

type HandleRedirectResponse = {
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

  public async handleRedirect({ authCodeResponse, originalAuthCodeUrlRequest }: HandleRedirectParams): Promise<HandleRedirectResponse> {
    if (!originalAuthCodeUrlRequest) {
      throw new Error('No auth code URL request found in session');
    }

    // TODO -- This validates the user as well, lets consider renaming this
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

    const {
      account: { idTokenClaims },
    } = ENTRA_ID_AUTHENTICATION_RESULT_SCHEMA.parse(await msalApp.acquireTokenByCode(tokenRequest, authCodeResponse));

    return { entraIdUser: idTokenClaims };
  }
}
