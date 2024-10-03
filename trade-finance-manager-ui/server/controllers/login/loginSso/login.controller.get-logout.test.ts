import httpMocks from 'node-mocks-http';
import { LoginController } from './login.controller';
import { EntraIdService } from '../../../services/entra-id.service';
import { EntraIdServiceMockBuilder } from '../../../../test-helpers/mocks';

describe('controllers - login (sso)', () => {
  describe('getLogout', () => {
    let entraIdService: EntraIdService;
    let loginController: LoginController;

    beforeEach(() => {
      entraIdService = new EntraIdServiceMockBuilder().build();
      loginController = new LoginController({ entraIdService });
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
      expect(req.session.destroy).toHaveBeenCalledTimes(1);
    });

    function getHttpMocks() {
      return httpMocks.createMocks({
        session: { destroy: jest.fn((callback: () => void) => callback()) },
      });
    }
  });
});
