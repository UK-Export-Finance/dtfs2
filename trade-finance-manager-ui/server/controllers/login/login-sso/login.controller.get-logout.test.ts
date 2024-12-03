import httpMocks from 'node-mocks-http';
import { LoginController } from './login.controller';
import { LoginService } from '../../../services/login.service';
import { LoginServiceMockBuilder } from '../../../../test-helpers/mocks';

describe('controllers - login (sso)', () => {
  describe('getLogout', () => {
    let loginService: LoginService;
    let loginController: LoginController;

    beforeEach(() => {
      loginService = new LoginServiceMockBuilder().build();
      loginController = new LoginController({ loginService });
    });

    it('redirects to /', () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      loginController.getLogout(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual('/');
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
