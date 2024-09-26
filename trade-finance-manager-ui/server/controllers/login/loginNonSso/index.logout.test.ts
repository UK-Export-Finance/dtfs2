import httpMocks from 'node-mocks-http';
import { logout } from '.';

jest.mock('../../../services/entra-id-service', () => ({
  getLoginUrl: jest.fn(),
}));

describe('controllers - login (sso)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
