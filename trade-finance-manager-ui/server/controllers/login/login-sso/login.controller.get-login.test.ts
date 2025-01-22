import httpMocks from 'node-mocks-http';
import { resetAllWhenMocks, when } from 'jest-when';
import { aTfmSessionUser } from '../../../../test-helpers';
import { LoginController } from './login.controller';
import { LoginService } from '../../../services/login.service';
import { LoginServiceMockBuilder } from '../../../../test-helpers/mocks';

describe('controllers - login (sso)', () => {
  describe('getLogin', () => {
    const mockAuthCodeUrl = `mock-auth-code-url`;
    const mockAuthCodeUrlRequest = `mock-auth-code-url-request`;

    let loginController: LoginController;
    let loginService: LoginService;
    const getAuthCodeUrlMock = jest.fn();
    const next = jest.fn();

    beforeEach(() => {
      resetAllWhenMocks();
      jest.resetAllMocks();

      loginService = new LoginServiceMockBuilder().with({ getAuthCodeUrl: getAuthCodeUrlMock }).build();

      loginController = new LoginController({ loginService });
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

        it('should redirect to auth code URL', async () => {
          // Arrange
          const { req, res } = httpMocks.createMocks({ session: {} });

          // Act
          await loginController.getLogin(req, res, next);

          // Assert
          expect(res._getRedirectUrl()).toEqual(mockAuthCodeUrl);
        });

        it('should override session login data if present', async () => {
          // Arrange
          const { req, res } = httpMocks.createMocks({
            session: { loginData: { authCodeUrlRequest: 'an old auth code url request', aField: 'another field' } },
          });

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

        it('should call next with error', async () => {
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
