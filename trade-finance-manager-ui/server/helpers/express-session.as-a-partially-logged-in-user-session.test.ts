import httpMocks from 'node-mocks-http';
import { UserPartialLoginDataNotDefinedError } from '@ukef/dtfs2-common';
import { asPartiallyLoggedInUserSession } from './express-session';

describe('express-session helper', () => {
  describe('asAPartiallyLoggedInUserSession', () => {
    it('throws if the login data is not defined', () => {
      // Arrange
      const req = httpMocks.createRequest({
        session: { loginData: undefined },
      });

      // Act / Assert
      expect(() => asPartiallyLoggedInUserSession(req.session)).toThrow(UserPartialLoginDataNotDefinedError);
    });

    it('returns the session user values', () => {
      // Arrange
      const loginData = 'partial-user-login-data';
      const req = httpMocks.createRequest({
        session: { loginData },
      });

      // Act
      const result = asPartiallyLoggedInUserSession(req.session);

      // Assert
      expect(result.loginData).toEqual(loginData);
    });
  });
});
