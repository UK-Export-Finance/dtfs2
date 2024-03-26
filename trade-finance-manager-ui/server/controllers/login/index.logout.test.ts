/* eslint-disable @typescript-eslint/no-unsafe-call */
import { createMocks } from 'node-mocks-http';
import api from '../../api';
import loginController from '.';

const { AZURE_SSO_AUTHORITY } = process.env;

describe('controllers - login', () => {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET - logout', () => {
    it('should return to login page on logout', async () => {
      // Arrange
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      const session = { user: {}, destroy: jest.fn((callback) => callback()) };

      const { req, res } = createMocks({ session });
      api.getAuthLogoutUrl = () => Promise.resolve({ logoutUrl: `${AZURE_SSO_AUTHORITY}?something=` });

      // Act
      await loginController.logout(req, res);

      // Assert
      expect(res._getRedirectUrl()).toMatch(/^https:\/\/login\.microsoftonline\.com\/*/);
      expect(res._getStatusCode()).toEqual(302);
      expect(session.destroy).toHaveBeenCalled();
    });
  });
});
