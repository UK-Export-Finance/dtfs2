import * as msalNode from '@azure/msal-node';
import { EntraIdConfigMockBuilder, EntraIdApiMockBuilder } from '../../test-helpers/mocks';
import { EntraIdConfig } from '../configs/entra-id.config';
import { EntraIdService } from './entra-id.service';
import { EntraIdApi } from '../third-party-apis/entra-id.api';

describe('EntraIdService', () => {
  describe('getAuthCodeUrl', () => {
    let entraIdConfig: EntraIdConfig;
    let entraIdApi: EntraIdApi;

    let base64EncodeSpy: jest.SpyInstance;

    const mockScope = ['a-scope'];
    const mockGuid = 'mock-guid';
    const mockBase64EncodedState = 'mock-base64-encoded-state';
    const mockAuthorityMetaDataUrl = 'mock-authority-metadata-url';
    const authCodeUrlFromMsalApp = 'mocked-auth-code-url-from-msal-app';
    const mockRedirectUri = 'a-redirect-uri';

    beforeEach(() => {
      jest.resetAllMocks();

      base64EncodeSpy = jest.spyOn(msalNode.CryptoProvider.prototype, 'base64Encode').mockReturnValue(mockBase64EncodedState);

      jest.spyOn(msalNode, 'CryptoProvider').mockReturnValue({
        createNewGuid: () => mockGuid,
        base64Encode: base64EncodeSpy,
      } as unknown as msalNode.CryptoProvider);

      jest.spyOn(msalNode, 'ConfidentialClientApplication').mockImplementation(() => {
        return {
          getAuthCodeUrl: jest.fn().mockResolvedValue(authCodeUrlFromMsalApp),
        } as unknown as msalNode.ConfidentialClientApplication;
      });

      entraIdConfig = new EntraIdConfigMockBuilder()
        .withDefaults()
        .with({
          authorityMetadataUrl: mockAuthorityMetaDataUrl,
          scopes: mockScope,
          redirectUri: mockRedirectUri,
        })
        .build();

      entraIdApi = new EntraIdApiMockBuilder().withDefaults().build();
    });

    it('calls base64Encode with the expected stringifiedstate', async () => {
      // Arrange
      const successRedirect = 'a-success-redirect';
      const service = getAEntraIdServiceInstance();

      // Act
      await service.getAuthCodeUrl({ successRedirect });

      // Assert
      expect(base64EncodeSpy).toHaveBeenCalledWith(JSON.stringify({ csrfToken: mockGuid, successRedirect }));
    });

    it('returns the auth code url from the msal app', async () => {
      // Arrange
      const service = getAEntraIdServiceInstance();

      // Act
      const { authCodeUrl } = await service.getAuthCodeUrl({});

      // Assert
      expect(authCodeUrl).toEqual(authCodeUrlFromMsalApp);
    });

    it('returns the auth code url request', async () => {
      // Arrange
      const service = getAEntraIdServiceInstance();

      // Act
      const { authCodeUrlRequest } = await service.getAuthCodeUrl({});

      // Assert
      expect(authCodeUrlRequest).toEqual({
        scopes: mockScope,
        redirectUri: 'a-redirect-uri',
        responseMode: 'form_post',
        state: mockBase64EncodedState,
      });
    });

    function getAEntraIdServiceInstance() {
      return new EntraIdService({ entraIdConfig, entraIdApi });
    }
  });
});
