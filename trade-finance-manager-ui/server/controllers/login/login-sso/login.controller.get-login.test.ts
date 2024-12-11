import httpMocks from 'node-mocks-http';
import { resetAllWhenMocks, when } from 'jest-when';
import { AuthorizationUrlRequest } from '@azure/msal-node';
import { aTfmSessionUser } from '../../../../test-helpers';
import { LoginController } from './login.controller';
import { LoginService } from '../../../services/login.service';
import { UserSessionService } from '../../../services/user-session.service';
import { LoginServiceMockBuilder, UserSessionServiceMockBuilder } from '../../../../test-helpers/mocks';

describe('controllers - login (sso)', () => {
  describe('getLogin', () => {
    const mockAuthCodeUrl = `mock-auth-code-url`;
    const mockAuthCodeUrlRequest = `mock-auth-code-url-request`;

    let loginController: LoginController;
    let loginService: LoginService;
    let userSessionService: UserSessionService;

    const getAuthCodeUrlMock = jest.fn();
    const next = jest.fn();

    beforeEach(() => {
      resetAllWhenMocks();
      jest.resetAllMocks();

      loginService = new LoginServiceMockBuilder().with({ getAuthCodeUrl: getAuthCodeUrlMock }).build();
      userSessionService = new UserSessionServiceMockBuilder().build();
      loginController = new LoginController({ loginService, userSessionService });
    });

    describe('when there is a user session', () => {
      const requestSession = {
        user: aTfmSessionUser(),
        userToken: 'abc123',
      };

      const getHttpMocks = () =>
        httpMocks.createMocks({
          session: requestSession,
        });

      it('redirects to /home', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await loginController.getLogin(req, res, next);

        // Assert
        expect(res._getRedirectUrl()).toEqual('/home');
      });
    });

    describe('when there is no user session', () => {
      describe('when the getAuthCodeUrl api call is successful', () => {
        beforeEach(() => {
          mockSuccessfulGetAuthCodeUrl();
        });

        it('redirects to login URL', async () => {
          // Arrange
          const { req, res } = httpMocks.createMocks({ session: {} });

          // Act
          await loginController.getLogin(req, res, next);

          // Assert
          expect(res._getRedirectUrl()).toEqual(mockAuthCodeUrl);
        });

        it.only('overrides session login data if present', async () => {
          // Arrange
          const { req, res } = httpMocks.createMocks({
            session: { loginData: { authCodeUrlRequest: 'an old auth code url request', aField: 'another field' } },
          });

          req.session.loginData = { authCodeUrlRequest: 'old-auth-code-url-request' as unknown as AuthorizationUrlRequest };

          // Act
          await loginController.getLogin(req, res, next);

          // Assert
          expect(req.session.loginData).toEqual({ authCodeUrlRequest: mockAuthCodeUrlRequest });
        });
      });

      describe('when the getAuthCodeUrl api call is unsuccessful', () => {
        beforeEach(() => {
          mockFailedGetAuthCodeUrl();
        });

        it('calls next with error', async () => {
          // Arrange
          const { req, res } = httpMocks.createMocks({ session: {} });
          const error = new Error('getAuthCodeUrl error');
          getAuthCodeUrlMock.mockRejectedValueOnce(error);

          // Act
          await loginController.getLogin(req, res, next);

          // Assert
          expect(next).toHaveBeenCalledWith(error);
        });
      });
    });

    function mockSuccessfulGetAuthCodeUrl() {
      when(getAuthCodeUrlMock)
        .calledWith({ successRedirect: '/' })
        .mockResolvedValueOnce({ authCodeUrl: mockAuthCodeUrl, authCodeUrlRequest: mockAuthCodeUrlRequest });
    }

    function mockFailedGetAuthCodeUrl() {
      when(getAuthCodeUrlMock).calledWith({ successRedirect: '/' }).mockRejectedValueOnce(new Error('getAuthCodeUrl error'));
    }
  });
});
