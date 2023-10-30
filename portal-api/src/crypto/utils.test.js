const jsonwebtoken = require('jsonwebtoken');
const crypto = require('crypto');
const { issueValidUsernameAndPasswordJWT, issueValid2faJWT } = require('./utils');
const { MAKER } = require('../v1/roles/roles');
const { LOGIN_STATUSES } = require('../constants');

describe('crypto utils', () => {
  const user = {
    username: 'HSBC-maker-1',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'One',
    email: 'one@email.com',
    timezone: 'Europe/London',
    roles: [MAKER],
    bank: {
      id: '961',
      name: 'HSBC',
      emails: ['maker1@ukexportfinance.gov.uk', 'maker2@ukexportfinance.gov.uk'],
    },
  };

  const existingSessionIdentifier = crypto.randomBytes(32).toString('hex');

  const userWithExistingSessionIdentifier = { ...user, sessionIdentifier: existingSessionIdentifier };

  describe('issueValidUsernameAndPasswordJWT', () => {
    it('should not use an existing session identifier', () => {
      const { sessionIdentifier } = issueValidUsernameAndPasswordJWT(userWithExistingSessionIdentifier);
      expect(sessionIdentifier).not.toEqual(existingSessionIdentifier);
    });

    it('should return a session identifier', () => {
      const { sessionIdentifier } = issueValidUsernameAndPasswordJWT(user);
      expect(is32ByteHex(sessionIdentifier)).toEqual(true);
    });

    it('should return a token with the expected payload', () => {
      const { token, sessionIdentifier } = issueValidUsernameAndPasswordJWT(user);
      const decodedToken = jsonwebtoken.decode(token.replace('Bearer ', ''));
      expect(decodedToken.iat).toBeDefined();
      expect(decodedToken.exp).toBeDefined();
      expect(decodedToken.username).toEqual(user.username);
      expect(decodedToken.loginStatus).toEqual(LOGIN_STATUSES.VALID_USERNAME_AND_PASSWORD);
      expect(decodedToken.sessionIdentifier).toEqual(sessionIdentifier);
    });

    it('should return the correct expiry time', () => {
      const { expires } = issueValidUsernameAndPasswordJWT(user);
      expect(expires).toEqual('30m');
    });
  });

  describe('issueValid2faJWT', () => {
    it('should throw an error if no existing session identifier is present', () => {
      expect(() => issueValid2faJWT(user)).toThrow('User does not have a session identifier');
    });

    it('should return the input session identifier', () => {
      const { sessionIdentifier } = issueValid2faJWT(userWithExistingSessionIdentifier);
      expect(is32ByteHex(sessionIdentifier)).toEqual(true);
      expect(sessionIdentifier).toEqual(existingSessionIdentifier);
    });

    it('should return a token with the expected payload', () => {
      const { token, sessionIdentifier } = issueValid2faJWT(userWithExistingSessionIdentifier);
      const decodedToken = jsonwebtoken.decode(token.replace('Bearer ', ''));
      expect(decodedToken.iat).toBeDefined();
      expect(decodedToken.exp).toBeDefined();
      expect(decodedToken.username).toEqual(user.username);
      expect(decodedToken.loginStatus).toEqual(LOGIN_STATUSES.VALID_2FA);
      expect(decodedToken.sessionIdentifier).toEqual(sessionIdentifier);
      expect(decodedToken.sessionIdentifier).toEqual(existingSessionIdentifier);
      expect(decodedToken.roles).toEqual(user.roles);
      expect(decodedToken.bank).toEqual(user.bank);
    });

    it('should return the correct expiry time', () => {
      const { expires } = issueValid2faJWT(userWithExistingSessionIdentifier);
      expect(expires).toEqual('12h');
    });
  });

  function is32ByteHex(str) {
    return /^[0-9a-fA-F]{64}$/.test(str);
  }
});
