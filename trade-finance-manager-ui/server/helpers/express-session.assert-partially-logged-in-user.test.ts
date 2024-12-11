import httpMocks from 'node-mocks-http';
import { UserPartialLoginDataNotDefinedError } from '@ukef/dtfs2-common';
import { assertPartiallyLoggedInUser } from './express-session';

describe('express-session helper', () => {
  describe('assertPartiallyLoggedInUser', () => {
    it('throws if the login data is not defined', () => {
      // Arrange
      const req = httpMocks.createRequest({
        session: { loginData: undefined },
      });

      // Act / Assert
      expect(() => assertPartiallyLoggedInUser(req.session)).toThrow(UserPartialLoginDataNotDefinedError);
    });

    it('does not throw if login data is defined', () => {
      // Arrange
      const loginData = 'partial-user-login-data';
      const req = httpMocks.createRequest({
        session: { loginData },
      });

      // Act
      assertPartiallyLoggedInUser(req.session);
    });
  });
});
