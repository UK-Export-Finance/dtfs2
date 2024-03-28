const msal = require('@azure/msal-node');
const { processSsoRedirect } = require('.');
const authProvider = require('../auth-provider');
const tfmUser = require('./get-or-create-tfm-user');
const { issueJwtAndUpdateUser } = require('./issue-jwt-and-update-user');
const MOCK_ENTRA_USER = require('../../../__mocks__/mock-entra-user');
const MOCK_TFM_USERS = require('../../../__mocks__/mock-users');

const MOCK_TFM_USER = MOCK_TFM_USERS[0];

const cryptoProvider = new msal.CryptoProvider();

const mockPkceCodes = 'mock-pkce-codes';
const mockAuthCodeRequest = 'mock-auth-code-request';
const mockCode = 'mock-authz-code';
const mockToken = 'mock-token';
const mockRedirectUrl = 'mock-url';

jest.mock('./issue-jwt-and-update-user', () => ({
  issueJwtAndUpdateUser: jest.fn().mockResolvedValue('mock-token')
}));

const mockState = cryptoProvider.base64Encode(
  JSON.stringify({
    csrfToken: mockToken,
    redirectTo: '/',
  })
);

const baseParams = {
  pkceCodes: mockPkceCodes,
  authCodeRequest: mockAuthCodeRequest,
  code: mockCode,
  state: mockState,
};

describe('auth-service/index', () => {
  describe('processSsoRedirect',()=> {
    let result;

    beforeAll(async () => {
      authProvider.handleRedirect = jest.fn().mockResolvedValue(MOCK_ENTRA_USER);
      tfmUser.getOrCreate = jest.fn().mockResolvedValue(MOCK_TFM_USER);
      authProvider.loginRedirectUrl = jest.fn(() => mockRedirectUrl);

      result = await processSsoRedirect(baseParams);
    });

    it('should call authProvider.handleRedirect with the provided params', () => {
      expect(authProvider.handleRedirect).toHaveBeenCalledTimes(1);
      expect(authProvider.handleRedirect).toHaveBeenCalledWith(
        mockPkceCodes, mockAuthCodeRequest, mockCode
      );
    });

    it('should call tfmUser.getOrCreate with the retrieved Entra user', () => {
      expect(tfmUser.getOrCreate).toHaveBeenCalledTimes(1);
      expect(tfmUser.getOrCreate).toHaveBeenCalledWith(MOCK_ENTRA_USER);
    });

    it('should call issueJwtAndUpdateUser with the retrieved TFM user', () => {
      expect(issueJwtAndUpdateUser).toHaveBeenCalledTimes(1);
      expect(issueJwtAndUpdateUser).toHaveBeenCalledWith(MOCK_TFM_USER);
    });

    it('should call authProvider.loginRedirectUrl with the provided params', () => {
      expect(authProvider.loginRedirectUrl).toHaveBeenCalledTimes(1);
      expect(authProvider.loginRedirectUrl).toHaveBeenCalledWith(mockState);
    });

    it('should return a TFM user, token and redirect URL', () => {
      const expected = {
        tfmUser: MOCK_TFM_USER,
        token: mockToken,
        redirectUrl: mockRedirectUrl,
      };

      expect(result).toEqual(expected);
    });

    describe('when pkceCodes not provided', () => {
      it('should throw an error', async () => {
        result = await processSsoRedirect({
          ...baseParams,
          pkceCodes: null,
        });

        expect(result).toEqual({});
      });
    });

    describe('when authCodeRequest not provided', () => {
      it('should throw an error', async () => {
        result = await processSsoRedirect({
          ...baseParams,
          authCodeRequest: null,
        });

        expect(result).toEqual({});
      });
    });

    describe('when code not provided', () => {
      it('should throw an error', async () => {
        result = await processSsoRedirect({
          ...baseParams,
          code: null,
        });

        expect(result).toEqual({});
      });
    });

    describe('when state not provided', () => {
      it('should throw an error', async () => {
        result = await processSsoRedirect({
          ...baseParams,
          state: null,
        });

        expect(result).toEqual({});
      });
    });
  });
});
