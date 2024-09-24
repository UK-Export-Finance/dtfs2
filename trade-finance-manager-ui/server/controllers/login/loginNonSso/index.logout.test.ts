import httpMocks from 'node-mocks-http';
import { getLoginUrl } from '../../../services/entra-id-service';
import { logout } from '.';

const mockLoginRedirectUrl = `mock-login-redirect-url`;

jest.mock('../../../services/entra-id-service', () => ({
  getLoginUrl: jest.fn(),
}));

describe('controllers - login (sso)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getLoginUrl).mockReturnValue(mockLoginRedirectUrl);
  });

  describe('logout', () => {
    const getHttpMocks = () =>
      httpMocks.createMocks({
        session: { destroy: jest.fn((callback: () => void) => callback()) },
      });

    it('redirects to /', () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      logout(req, res);

      // Assert
      expect(res._getRedirectUrl()).toBe('/');
    });

    it('destroys the session', () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      logout(req, res);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(req.session.destroy).toHaveBeenCalled();
    });
  });
});
