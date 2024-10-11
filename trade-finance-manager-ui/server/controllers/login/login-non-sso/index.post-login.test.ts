import httpMocks from 'node-mocks-http';
import { postLogin } from '.';

jest.mock('../../../api', () => ({
  login: jest.fn().mockResolvedValue({
    success: true,
    token: 'mock-token',
    user: {
      email: 'mock-email',
      team: 'mock-team',
      roles: ['mock-role'],
    },
  }),
}));

describe('controllers - login (sso)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('postLogin', () => {
    it('should render login template if login unsuccessful', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: {},
        body: {},
      });

      // Act
      await postLogin(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('login.njk');
      expect(res._getRenderData()).toStrictEqual({
        errors: {
          errorSummary: [
            {
              href: '#email',
              text: 'Enter an email address in the correct format, for example, name@example.com',
            },
            {
              href: '#password',
              text: 'Enter a valid password',
            },
          ],
          fieldErrors: {
            email: {
              text: 'Enter an email address in the correct format, for example, name@example.com',
            },
            password: {
              text: 'Enter a valid password',
            },
          },
        },
      });
    });

    it('should redirect to /home if login successful', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: {},
        body: { email: 'T1_USER_1', password: 'AbC!2345' },
      });

      // Act
      await postLogin(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual('/home');
    });
  });
});
