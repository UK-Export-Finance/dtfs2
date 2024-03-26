const { issueJWT } = require('./crypto.util');
const MOCK_USERS = require('../v1/__mocks__/mock-users');

describe('crypto utils', () => {
  describe('issueJWT', () => {
    it('should issue token and give new session id', () => {
      const { token, expires, sessionIdentifier } = issueJWT(MOCK_USERS[0]);

      expect(token).toMatch(/Bearer .*/);
      expect(expires).toEqual('1d');
      expect(sessionIdentifier).toMatch(/^[a-f0-9]+$/);
    });
  });
});
