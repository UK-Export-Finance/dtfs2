import httpMocks from 'node-mocks-http';
import { LoginController } from './login.controller';
import { LoginService } from '../../../services/login.service';
import { LoginServiceMockBuilder, UserSessionServiceMockBuilder } from '../../../../test-helpers/mocks';
import { UserSessionService } from '../../../services/user-session.service';

describe('controllers - login (sso)', () => {
  describe('getLogout', () => {
    let loginService: LoginService;
    let userSessionService: UserSessionService;
    let loginController: LoginController;

    beforeEach(() => {
      loginService = new LoginServiceMockBuilder().build();
      userSessionService = new UserSessionServiceMockBuilder().build();
      loginController = new LoginController({ loginService, userSessionService });
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
