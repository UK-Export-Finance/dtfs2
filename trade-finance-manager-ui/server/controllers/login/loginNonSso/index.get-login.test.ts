import httpMocks from 'node-mocks-http';
import { aTfmSessionUser } from '../../../../test-helpers';
import { getLogin } from '.';

describe('controllers - login (sso)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

      it('renders the login page', () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        getLogin(req, res);

        // Assert
        expect(res._getRenderView()).toBe('login.njk');
        expect(res._getRenderData()).toStrictEqual({ user: requestSession.user });
      });
    });

    describe('when there is not a user session', () => {
      const requestSession = {
        user: {},
      };

      const getHttpMocks = () =>
        httpMocks.createMocks({
          session: requestSession,
        });

      it('renders the login page', () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        getLogin(req, res);

        // Assert
        expect(res._getRenderView()).toBe('login.njk');
        expect(res._getRenderData()).toStrictEqual({ user: requestSession.user });
      });
    });
  });
});
