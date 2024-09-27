import httpMocks from 'node-mocks-http';
import { resetAllWhenMocks, when } from 'jest-when';
import { mock } from 'jest-mock-extended';
import { aTfmSessionUser } from '../../../../test-helpers';
import { LoginController } from './login.controller';
import { EntraIdService } from '../../../services/entra-id.service';

const mockAuthCodeUrl = `mock-auth-code-url`;
const mockAuthCodeUrlRequest = `mock-auth-code-url-request`;

describe('controllers - login (sso)', () => {
  let loginController: LoginController;
  let entraIdService: EntraIdService;
  const getAuthCodeUrlMock = jest.fn();

  beforeEach(() => {
    resetAllWhenMocks();
    jest.resetAllMocks();

    entraIdService = mock<EntraIdService>({
      getAuthCodeUrl: getAuthCodeUrlMock,
    });
    loginController = new LoginController(entraIdService);

    mockSuccessfulGetAuthCodeUrl();
  });

  describe('getLogin', () => {
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
      const getHttpMocks = () => httpMocks.createMocks({ session: {} });

      it('redirects to login URL', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await loginController.getLogin(req, res);

        // Assert
        expect(res._getRedirectUrl()).toBe(mockAuthCodeUrl);
      });
    });
  });

  function mockSuccessfulGetAuthCodeUrl() {
    when(getAuthCodeUrlMock)
      .calledWith({ successRedirect: '/' })
      .mockResolvedValueOnce({ authCodeUrl: mockAuthCodeUrl, authCodeUrlRequest: mockAuthCodeUrlRequest });
  }
});
