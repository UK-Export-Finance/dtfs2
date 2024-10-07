import httpMocks from 'node-mocks-http';
import { resetAllWhenMocks, when } from 'jest-when';
import { aTfmSessionUser } from '../../../../test-helpers';
import { LoginController } from './login.controller';
import { EntraIdService } from '../../../services/entra-id.service';
import { EntraIdServiceMockBuilder } from '../../../../test-helpers/mocks';

describe('controllers - login (sso)', () => {
  describe('getLogin', () => {
    const mockAuthCodeUrl = `mock-auth-code-url`;
    const mockAuthCodeUrlRequest = `mock-auth-code-url-request`;

    let loginController: LoginController;
    let entraIdService: EntraIdService;
    const getAuthCodeUrlMock = jest.fn();

    beforeEach(() => {
      resetAllWhenMocks();
      jest.resetAllMocks();

      entraIdService = new EntraIdServiceMockBuilder().with({ getAuthCodeUrl: getAuthCodeUrlMock }).build();

      loginController = new LoginController({ entraIdService });

      mockSuccessfulGetAuthCodeUrl();
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
        await loginController.getLogin(req, res);

        // Assert
        expect(res._getRedirectUrl()).toBe('/home');
      });
    });

    describe('when there is no user session', () => {
      it('redirects to login URL', async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({ session: {} });

        // Act
        await loginController.getLogin(req, res);

        // Assert
        expect(res._getRedirectUrl()).toBe(mockAuthCodeUrl);
      });

      it('overrides session login data if present', async () => {
        // Arrange
        const { req, res } = httpMocks.createMocks({ session: { loginData: { authCodeUrlRequest: 'an old auth code url request', aField: 'another field' } } });

        req.session.loginData = { authCodeUrlRequest: 'old-auth-code-url-request' };

        // Act
        await loginController.getLogin(req, res);

        // Assert
        expect(req.session.loginData).toEqual({ authCodeUrlRequest: mockAuthCodeUrlRequest });
      });
    });

    function mockSuccessfulGetAuthCodeUrl() {
      when(getAuthCodeUrlMock)
        .calledWith({ successRedirect: '/' })
        .mockResolvedValueOnce({ authCodeUrl: mockAuthCodeUrl, authCodeUrlRequest: mockAuthCodeUrlRequest });
    }
  });
});
