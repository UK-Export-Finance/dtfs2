/* eslint-disable @typescript-eslint/no-unsafe-call */
import httpMocks from 'node-mocks-http';
import api from '../../api';
import loginController from '.';

describe('controllers - login', () => {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET - login', () => {
    it('should redirect to login.microsoftonline.com if no user object in session', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({ session: {} });
      api.getAuthLoginUrl = () => Promise.resolve({ loginUrl: 'https://login.microsoftonline.com/?something' });

      // Act
      await loginController.getLogin(req, res);

      // Assert
      expect(res._getRedirectUrl()).toMatch(/^https:\/\/login\.microsoftonline\.com\/*/);
    });

    it('should redirect to /home if user object exist in session', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({ session: { user: {} } });
      api.getAuthLoginUrl = () => Promise.resolve({ loginUrl: 'https://login.microsoftonline.com/?something' });

      // Act
      await loginController.getLogin(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual('/home');
    });
  });

  describe('POST - handleSsoRedirect', () => {
    it('should render acceptExternalSsoPost form if request is from Microsoft', async () => {
      // Arrange
      const requestBody = {
        code: 'test',
        client_info: 'test',
        state: 'test',
        session_state: 'test',
      };
      const { req, res } = httpMocks.createMocks({ session: {}, body: requestBody });

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
      const { req, res } = httpMocks.createMocks(reqData);

      // Act
      await loginController.handleSsoRedirect(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual('/after-login-test-url');
    });
  });

  describe('GET - logout', () => {
    it('should return to login page on logout', async () => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      const { req, res } = httpMocks.createMocks({ session: { user: {}, destroy: jest.fn((callback) => callback()) } });
      api.getAuthLogoutUrl = () => Promise.resolve({ logoutUrl: 'https://login.microsoftonline.com?something=' });

      // Act
      await loginController.logout(req, res);

      // Assert
      expect(res._getRedirectUrl()).toMatch(/^https:\/\/login\.microsoftonline\.com\/*/);
    });
  });
});
