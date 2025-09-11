import { ConfidentialClientApplication, CryptoProvider } from '@azure/msal-node';
import { EntraIdConfig } from '../configs/entra-id.config';
import { EntraIdService } from './entra-id.service';
import { EntraIdApi } from '../third-party-apis/entra-id.api';
import { EntraIdApiMockBuilder, EntraIdConfigMockBuilder } from '../__mocks__/builders';

jest.mock('@azure/msal-node', () => {
  return {
    ...jest.requireActual('@azure/msal-node'),
    ConfidentialClientApplication: jest.fn(),
  } as unknown as typeof import('@azure/msal-node');
});

describe('EntraIdService', () => {
  describe('getAuthCodeUrl', () => {
    let entraIdConfig: EntraIdConfig;
    let entraIdApi: EntraIdApi;
    let base64EncodeSpy: jest.SpyInstance;

    const mockScope = ['a-scope'];
    const mockGuid = 'mock-guid';
    const mockBase64EncodedState = 'mock-base64-encoded-state';
    const mockAuthorityMetaDataUrl = 'mock-authority-metadata-url';
    const authCodeUrlFromMsalApp = 'mock-auth-code-url-from-msal-app';
    const mockRedirectUri = 'mock-redirect-uri';

    beforeEach(() => {
      jest.spyOn(CryptoProvider.prototype, 'createNewGuid').mockReturnValue(mockGuid);
      base64EncodeSpy = jest.spyOn(CryptoProvider.prototype, 'base64Encode').mockReturnValue(mockBase64EncodedState);

      jest.mocked(ConfidentialClientApplication).mockImplementation(() => {
        return {
          getAuthCodeUrl: jest.fn().mockResolvedValue(authCodeUrlFromMsalApp),
        } as unknown as ConfidentialClientApplication;
      });

      entraIdConfig = new EntraIdConfigMockBuilder()
        .with({
          authorityMetadataUrl: mockAuthorityMetaDataUrl,
          scopes: mockScope,
          redirectUri: mockRedirectUri,
        })
        .build();

      entraIdApi = new EntraIdApiMockBuilder().build();
    });

    it('should call base64Encode with the expected stringifiedstate', async () => {
      // Arrange
      const successRedirect = 'a-success-redirect';
      const service = getAEntraIdServiceInstance();

      // Act
      await service.getAuthCodeUrl({ successRedirect });

      // Assert
      expect(base64EncodeSpy).toHaveBeenCalledWith(JSON.stringify({ csrfToken: mockGuid, successRedirect }));
    });

    it('should return the auth code url from the msal app', async () => {
      // Arrange
      const service = getAEntraIdServiceInstance();

      // Act
      const { authCodeUrl } = await service.getAuthCodeUrl({});

      // Assert
      expect(authCodeUrl).toEqual(authCodeUrlFromMsalApp);
    });

    it('should return the auth code url request', async () => {
      // Arrange
      const service = getAEntraIdServiceInstance();

      // Act
      const { authCodeUrlRequest } = await service.getAuthCodeUrl({});

      // Assert
      expect(authCodeUrlRequest).toEqual({
        scopes: mockScope,
        redirectUri: mockRedirectUri,
        responseMode: 'form_post',
        state: mockBase64EncodedState,
      });
    });

    function getAEntraIdServiceInstance() {
      return new EntraIdService({ entraIdConfig, entraIdApi });
    }
  });
});
