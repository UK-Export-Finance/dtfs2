import httpMocks from 'node-mocks-http';
import { aTfmSessionUser } from '../../../../test-helpers';
import { getLogin } from '.';
import { getLoginUrl } from '../../../services/entra-id-service';

const mockLoginRedirectUrl = `mock-login-redirect-url`;

jest.mock('../../../services/entra-id-service', () => ({
  getLoginUrl: jest.fn(),
}));

describe('controllers - login (sso)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getLoginUrl).mockReturnValue(mockLoginRedirectUrl);
  });

  describe('getLogin', () => {
    describe('when there is a user session', () => {
      const requestSession = {
        user: aTfmSessionUser(),
        userToken: 'abc123',
      };

      const getHttpMocks = () =>
        httpMocks.createMocks({
          session: requestSession,
        });

      it('redirects to /home', () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        getLogin(req, res);

        // Assert
        expect(res._getRedirectUrl()).toBe('/home');
      });
    });

    describe('when there is no user session', () => {
      const getHttpMocks = () => httpMocks.createMocks({ session: {} });

      it('redirects to login URL', () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        getLogin(req, res);

        // Assert
        expect(res._getRedirectUrl()).toBe(mockLoginRedirectUrl);
      });
    });
  });
});
