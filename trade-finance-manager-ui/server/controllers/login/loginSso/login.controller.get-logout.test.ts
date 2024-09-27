import httpMocks from 'node-mocks-http';
import { mock } from 'jest-mock-extended';
import { LoginController } from './login.controller';
import { EntraIdService } from '../../../services/entra-id.service';

describe('controllers - login (sso)', () => {
  let entraIdService: EntraIdService;
  let loginController: LoginController;

  beforeEach(() => {
    entraIdService = mock<EntraIdService>();
    loginController = new LoginController(entraIdService);
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
      loginController.getLogout(req, res);

      // Assert
      expect(res._getRedirectUrl()).toBe('/');
    });

    it('destroys the session', () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      loginController.getLogout(req, res);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(req.session.destroy).toHaveBeenCalled();
    });
  });
});
