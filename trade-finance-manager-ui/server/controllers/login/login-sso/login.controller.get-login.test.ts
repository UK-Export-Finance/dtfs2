import httpMocks from 'node-mocks-http';
import { resetAllWhenMocks, when } from 'jest-when';
import { aGetAuthCodeUrlResponse } from '@ukef/dtfs2-common';
import { aTfmSessionUser } from '../../../../test-helpers';
import { LoginController } from './login.controller';
import { LoginService } from '../../../services/login.service';
import { UserSessionService } from '../../../services/user-session.service';
import { LoginServiceMockBuilder, UserSessionServiceMockBuilder } from '../../../../test-helpers/mocks';

describe('controllers - login (sso)', () => {
  describe('getLogin', () => {
    const validGetAuthCodeUrlResponse = aGetAuthCodeUrlResponse();
    const aRedirectUrl = '/a-redirect-url';

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

      it('should redirect to /home', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await loginController.getLogin(req, res);

        // Assert
        expect(res._getRedirectUrl()).toEqual('/home');
      });
    });

    describe('when there is no user session', () => {
      describe('when an originalUrl exists on the request', () => {
        it('should call getAuthCodeUrl with the originalUrl if present', async () => {
          // Arrange
          const { req, res } = httpMocks.createMocks({ session: {}, originalUrl: aRedirectUrl });

          // Act
          await loginController.getLogin(req, res);

          // Assert
          expect(getAuthCodeUrlMock).toHaveBeenCalledWith({ successRedirect: aRedirectUrl });
        });
      });

      describe('when an originalUrl does not exist on the request', () => {
        it('should call getAuthCodeUrl with "/" as the successRedirect', async () => {
          // Arrange
          const { req, res } = httpMocks.createMocks({ session: {} });

          // Act
          await loginController.getLogin(req, res);

          // Assert
          expect(getAuthCodeUrlMock).toHaveBeenCalledWith({ successRedirect: '/' });
        });
      });

      describe('when the getAuthCodeUrl api call is successful', () => {
        beforeEach(() => {
          mockSuccessfulGetAuthCodeUrl();
        });

        it('should redirect to auth code URL', async () => {
          // Arrange
          const { req, res } = httpMocks.createMocks({ session: {}, originalUrl: aRedirectUrl });

          // Act
          await loginController.getLogin(req, res);

          // Assert
          expect(res._getRedirectUrl()).toEqual(validGetAuthCodeUrlResponse.authCodeUrl);
        });

        it('should override session login data if present', async () => {
          // Arrange
          const { req, res } = httpMocks.createMocks({
            session: { loginData: { authCodeUrlRequest: 'an old auth code url request', aField: 'another field' } },
            originalUrl: aRedirectUrl,
          });

          // Act
          await loginController.getLogin(req, res);

          // Assert
          expect(req.session.loginData).toEqual({ authCodeUrlRequest: validGetAuthCodeUrlResponse.authCodeUrlRequest });
        });
      });

      describe('when the  api call is unsuccessful', () => {
        beforeEach(() => {
          mockFailedGetAuthCodeUrl();
        });

        it('should call next with error', async () => {
          // Arrange
          const { req, res } = httpMocks.createMocks({ session: {}, originalUrl: aRedirectUrl });

          const error = new Error('getAuthCodeUrl error');
          getAuthCodeUrlMock.mockRejectedValueOnce(error);

          // Act
          await loginController.getLogin(req, res);

          // Assert
          expect(next).toHaveBeenCalledWith(error);
        });
      });
    });

    function mockSuccessfulGetAuthCodeUrl() {
      when(getAuthCodeUrlMock).calledWith({ successRedirect: aRedirectUrl }).mockResolvedValueOnce(validGetAuthCodeUrlResponse);
    }

    function mockFailedGetAuthCodeUrl() {
      when(getAuthCodeUrlMock).calledWith({ successRedirect: aRedirectUrl }).mockRejectedValueOnce(new Error('getAuthCodeUrl error'));
    }
  });
});
