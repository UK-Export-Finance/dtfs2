import httpMocks from 'node-mocks-http';
import { asUserSession } from './express-session';
import { MOCK_TFM_SESSION_USER } from '../test-mocks/mock-tfm-session-user';

describe('express-session helper', () => {
  describe('asUserSession', () => {
    it('throws if the user is not defined', () => {
      // Arrange
      const req = httpMocks.createRequest({
        session: { user: undefined, userToken: 'user-token' },
      });

      // Act / Assert
      expect(() => asUserSession(req.session)).toThrow('Expected session.user to be defined');
    });

    it('throws if the userToken is not defined', () => {
      // Arrange
      const req = httpMocks.createRequest({
        session: { user: MOCK_TFM_SESSION_USER, userToken: undefined },
      });

      // Act / Assert
      expect(() => asUserSession(req.session)).toThrow('Expected session.userToken to be defined');
    });

    it('returns the session user values', () => {
      // Arrange
      const user = MOCK_TFM_SESSION_USER;
      const userToken = 'user-token';

      const req = httpMocks.createRequest({
        session: { user, userToken },
      });

      // Act
      const result = asUserSession(req.session);

      // Assert
      expect(result.user).toEqual(user);
      expect(result.userToken).toEqual(userToken);
    });
  });
});
