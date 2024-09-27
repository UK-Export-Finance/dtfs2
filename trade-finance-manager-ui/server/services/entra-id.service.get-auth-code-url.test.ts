import axios from 'axios';
import MockAdapter = require('axios-mock-adapter');
import { ConfidentialClientApplication, CryptoProvider, ResponseMode } from '@azure/msal-node';
import { EntraIdConfigMockBuilder } from '../../test-helpers/mocks/entra-id.config.mock';
import { EntraIdConfig } from '../configs/entra-id.config';
import { EntraIdService } from './entra-id.service';

const mockAxios = new MockAdapter(axios);

jest.mock('@azure/msal-node', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...jest.requireActual('@azure/msal-node'),
    ConfidentialClientApplication: jest.fn(),
  };
});

describe('EntraIdService', () => {
  describe('getAuthCodeUrl', () => {
    const mockScope = ['a-scope'];
    const mockGuid = 'mock-guid';
    const mockBase64EncodedState = 'mock-base64-encoded-state';
    const mockAuthorityMetaDataUrl = 'mock-authority-metadata-url';
    const authCodeUrlFromMsalApp = 'mocked-auth-code-url-from-msal-app';
    const mockRedirectUri = 'a-redirect-uri';
    let entraIdConfig: EntraIdConfig;

    beforeEach(() => {
      jest.spyOn(CryptoProvider.prototype, 'createNewGuid').mockReturnValue(mockGuid);
      jest.spyOn(CryptoProvider.prototype, 'base64Encode').mockReturnValue(mockBase64EncodedState);

      jest.mocked(ConfidentialClientApplication).mockImplementation(() => {
        return {
          getAuthCodeUrl: jest.fn().mockResolvedValue(authCodeUrlFromMsalApp),
        } as unknown as ConfidentialClientApplication;
      });

      entraIdConfig = new EntraIdConfigMockBuilder()
        .withDefaults()
        .with({
          authorityMetadataUrl: mockAuthorityMetaDataUrl,
          scopes: mockScope,
          redirectUri: mockRedirectUri,
        })
        .build();

      mockAxios.reset();
      mockAxios.onGet(entraIdConfig.authorityMetadataUrl).reply(200, { aMetaDataObject: 'a-meta-data-value' });
    });

    it('calls base64Encode with the expected stringifiedstate', async () => {
      // Arrange
      const successRedirect = 'a-success-redirect';
      const service = new EntraIdService(entraIdConfig);

      // Act
      await service.getAuthCodeUrl({ successRedirect });

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(CryptoProvider.prototype.base64Encode).toHaveBeenCalledWith(JSON.stringify({ csrfToken: mockGuid, successRedirect }));
    });

    it('returns the auth code url from the msal app', async () => {
      // Arrange
      const service = new EntraIdService(entraIdConfig);

      // Act
      const { authCodeUrl } = await service.getAuthCodeUrl({});

      // Assert
      expect(authCodeUrl).toEqual(authCodeUrlFromMsalApp);
    });

    it('returns the auth code url request', async () => {
      // Arrange
      const service = new EntraIdService(entraIdConfig);

      // Act
      const { authCodeUrlRequest } = await service.getAuthCodeUrl({});

      // Assert
      expect(authCodeUrlRequest).toEqual({
        scopes: mockScope,
        redirectUri: 'a-redirect-uri',
        responseMode: ResponseMode.FORM_POST,
        state: mockBase64EncodedState,
      });
    });
  });
});
