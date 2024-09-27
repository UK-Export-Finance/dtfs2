import { AuthorizationUrlRequest, ConfidentialClientApplication, Configuration as MsalAppConfig, CryptoProvider } from '@azure/msal-node';
import { DecodedAuthCodeRequestState } from '../types/entra-id';
import { EntraIdConfig } from '../configs/entra-id.config';
import { EntraIdApi } from '../apis/entra-id.api';

type GetAuthCodeUrlParams = {
  successRedirect?: string;
};

type GetAuthCodeUrlResponse = {
  authCodeUrl: string;
  authCodeUrlRequest: AuthorizationUrlRequest;
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
}
