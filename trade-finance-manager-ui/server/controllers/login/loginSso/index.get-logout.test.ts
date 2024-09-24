import httpMocks from 'node-mocks-http';
import { getLogout } from '.';
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

  describe('getLogout', () => {
    const getHttpMocks = () =>
      httpMocks.createMocks({
        session: { destroy: jest.fn((callback: () => void) => callback()) },
      });

    it('redirects to /', () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      getLogout(req, res);

      // Assert
      expect(res._getRedirectUrl()).toBe('/');
    });

    it('destroys the session', () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      getLogout(req, res);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(req.session.destroy).toHaveBeenCalled();
    });
  });
});
