/* eslint-disable @typescript-eslint/no-unsafe-call */
import { createMocks } from 'node-mocks-http';
import api from '../../api';
import loginController from '.';

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
});
