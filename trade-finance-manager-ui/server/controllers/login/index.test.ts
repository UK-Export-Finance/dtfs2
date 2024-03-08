/* eslint-disable @typescript-eslint/no-unsafe-call */
import { createMocks } from 'node-mocks-http';
import api from '../../api';
import loginController from '.';
import { SSO } from '../../constants';

const { AZURE_SSO_AUTHORITY } = process.env;

describe('controllers - login', () => {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET - login', () => {
    it('should redirect to login.microsoftonline.com if no user object in session', async () => {
      // Arrange
      const { req, res } = createMocks({ session: {} });
      api.getAuthLoginUrl = () => Promise.resolve({ loginUrl: `${AZURE_SSO_AUTHORITY}?something` });

      // Act
      await loginController.getLogin(req, res);

      // Assert
      expect(res._getRedirectUrl()).toMatch(/^https:\/\/login\.microsoftonline\.com\/*/);
    });

    it('should redirect to /home if user object exist in session', async () => {
      // Arrange
      const { req, res } = createMocks({ session: { user: {} } });
      api.getAuthLoginUrl = () => Promise.resolve({ loginUrl: `${AZURE_SSO_AUTHORITY}?something` });

      // Act
      await loginController.getLogin(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual('/home');
    });
  });

  describe('POST - handleSsoRedirect', () => {
    const requestBody = {
      code: 'test',
      client_info: 'test',
      state: 'test',
      session_state: 'test',
    };

    it('should render acceptExternalSsoPost form if request is from Microsoft', async () => {
      // Arrange
      const { req, res } = createMocks({ session: {}, body: requestBody, headers: { referrer: `${SSO.AUTHORITY}/`, host: '' } });

      // Act
      await loginController.handleSsoRedirect(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('sso/accept-external-sso-post.njk');
      expect(res._getRenderData()).toMatchObject({
        code: requestBody.code,
        clientInfo: requestBody.client_info,
        state: requestBody.state,
        sessionState: requestBody.session_state,
      });
      expect(res._getStatusCode()).toEqual(200);
    });

    it('should render error page if request is not from SSO AUTHORITY', async () => {
      // Arrange
      const { req, res } = createMocks({ session: {}, body: requestBody, headers: { referrer: '', host: '' } });

      // Act
      await loginController.handleSsoRedirect(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getStatusCode()).toEqual(500);
    });

    it('should accept request without referrer for localhost', async () => {
      // Arrange
      const { req, res } = createMocks({ session: {}, body: requestBody, headers: { referrer: '', host: 'localhost:5003' } });

      // Act
      await loginController.handleSsoRedirect(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('sso/accept-external-sso-post.njk');
      expect(res._getStatusCode()).toEqual(200);
    });

    it('should accept request without referrer for localhost:5003', async () => {
      // Arrange
      const { req, res } = createMocks({ session: {}, body: requestBody, headers: { referrer: '', host: 'localhost' } });

      // Act
      await loginController.handleSsoRedirect(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('sso/accept-external-sso-post.njk');
      expect(res._getStatusCode()).toEqual(200);
    });

    it('should call processSsoRedirect if this is second post from TFM Form', async () => {
      // Arrange
      api.processSsoRedirect = () => {
        const returnVal = {
          token: 'token',
          user: 'user',
          redirectUrl: '/after-login-test-url',
        };
        return Promise.resolve(returnVal);
      };
      const reqData = {
        session: {
          auth: {
            pkceCodes: 'test',
          }
        },
        body: {
          formId: 'any-value',
          code: 'test',
          client_info: 'test',
          state: 'test',
          session_state: 'test',
        },
      };
      const { req, res } = createMocks(reqData);

      // Act
      await loginController.handleSsoRedirect(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual('/after-login-test-url');
      expect(res._getStatusCode()).toEqual(302);
    });
  });

  describe('GET - logout', () => {
    it('should return to login page on logout', async () => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      const { req, res } = createMocks({ session: { user: {}, destroy: jest.fn((callback) => callback()) } });
      api.getAuthLogoutUrl = () => Promise.resolve({ logoutUrl: `${AZURE_SSO_AUTHORITY}?something=` });

      // Act
      await loginController.logout(req, res);

      // Assert
      expect(res._getRedirectUrl()).toMatch(/^https:\/\/login\.microsoftonline\.com\/*/);
      expect(res._getStatusCode()).toEqual(302);
    });
  });
});
