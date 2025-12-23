const jsonwebtoken = require('jsonwebtoken');
const crypto = require('crypto');
const { when } = require('jest-when');
const { PORTAL_LOGIN_STATUS } = require('@ukef/dtfs2-common');
const { issueValidUsernameAndPasswordJWT, issueValid2faJWT, validPassword } = require('./utils');
const { TEST_USER } = require('../../test-helpers/unit-test-mocks/mock-user');

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  pbkdf2Sync: jest.fn(),
}));

describe('crypto utils', () => {
  describe('validPassword', () => {
    const ITERATIONS = 10000;
    const KEYLEN = 64;
    const DIGEST = 'sha512';

    const A_SALT = 'a salt';
    const A_PASSWORD = 'a password';
    const A_HASH_AS_HEX = '61206861736820617320686578';
    const A_DIFFERENT_HASH_AS_HEX = '6120646966666572656e742068';
    const A_DIFFERENT_LENGTH_HASH_AS_HEX = '6120646966666572656e74206c656e677468206861736820617320686578';

    const A_HASH_AS_BUFFER = Buffer.from(A_HASH_AS_HEX, 'hex');

    beforeEach(() => {
      crypto.pbkdf2Sync = jest.fn();
      when(crypto.pbkdf2Sync).calledWith(A_PASSWORD, A_SALT, ITERATIONS, KEYLEN, DIGEST).mockReturnValueOnce(A_HASH_AS_BUFFER);
    });

    describe('when password hash matches the hash', () => {
      it('should return true', () => {
        const result = validPassword(A_PASSWORD, A_HASH_AS_HEX, A_SALT);

        expect(result).toEqual(true);
      });
    });

    const returnFalseTestCases = [
      {
        testName: 'when the hash is undefined',
        inputHash: undefined,
        inputSalt: A_SALT,
        inputPassword: A_PASSWORD,
      },
      {
        testName: 'when the salt is undefined',
        inputHash: A_HASH_AS_HEX,
        inputSalt: undefined,
        inputPassword: A_PASSWORD,
      },
      {
        testName: 'when the hashes have different lengths',
        inputHash: A_DIFFERENT_LENGTH_HASH_AS_HEX,
        inputSalt: A_SALT,
        inputPassword: A_PASSWORD,
      },
      { testName: 'when the hashes do not match', inputHash: A_DIFFERENT_HASH_AS_HEX, inputSalt: A_SALT },
    ];

    describe.each(returnFalseTestCases)('$testName', ({ inputHash, inputPassword, inputSalt }) => {
      it('should return false', () => {
        const result = validPassword(inputPassword, inputHash, inputSalt);
        expect(result).toEqual(false);
      });
    });
  });

  describe('issue JTW', () => {
    let DATE_NOW_IN_UNIX_TIME;

    beforeAll(() => {
      jest.useFakeTimers();
      DATE_NOW_IN_UNIX_TIME = Math.floor(Date.now().valueOf() / 1000);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    const USER = TEST_USER;

    const EXISTING_SESSION_IDENTIFIER = crypto.randomBytes(32).toString('hex');

    const USER_WITH_EXISTING_SESSION_IDENTIFIER = { ...USER, sessionIdentifier: EXISTING_SESSION_IDENTIFIER };

    const SECONDS_IN_105_MINUTES = 105 * 60;

    const SECONDS_IN_12_HOURS = 12 * 60 * 60;

    describe('issueValidUsernameAndPasswordJWT', () => {
      it('should not use an existing session identifier', () => {
        const { sessionIdentifier } = issueValidUsernameAndPasswordJWT(USER_WITH_EXISTING_SESSION_IDENTIFIER);
        expect(sessionIdentifier).not.toEqual(EXISTING_SESSION_IDENTIFIER);
      });

      it('should return a session identifier', () => {
        const { sessionIdentifier } = issueValidUsernameAndPasswordJWT(USER);
        expect(is32ByteHex(sessionIdentifier)).toEqual(true);
      });

      it('should return a token with the expected payload', () => {
        const { token, sessionIdentifier } = issueValidUsernameAndPasswordJWT(USER);
        const decodedToken = jsonwebtoken.decode(token.replace('Bearer ', ''));
        expect(decodedToken.iat).toEqual(DATE_NOW_IN_UNIX_TIME);
        expect(decodedToken.exp).toEqual(DATE_NOW_IN_UNIX_TIME + SECONDS_IN_105_MINUTES);
        expect(decodedToken.username).toEqual(USER.username);
        expect(decodedToken.loginStatus).toEqual(PORTAL_LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD);
        expect(decodedToken.sessionIdentifier).toEqual(sessionIdentifier);
      });

      it('should return the correct expiry time', () => {
        const { expires } = issueValidUsernameAndPasswordJWT(USER);
        expect(expires).toEqual('105m');
      });
    });

    describe('issueValid2faJWT', () => {
      it('should throw an error if no existing session identifier is present', () => {
        expect(() => issueValid2faJWT(USER)).toThrow('User does not have a session identifier');
      });

      it('should return the input session identifier', () => {
        const { sessionIdentifier } = issueValid2faJWT(USER_WITH_EXISTING_SESSION_IDENTIFIER);
        expect(is32ByteHex(sessionIdentifier)).toEqual(true);
        expect(sessionIdentifier).toEqual(EXISTING_SESSION_IDENTIFIER);
      });

      it('should return a token with the expected payload', () => {
        const { token, sessionIdentifier } = issueValid2faJWT(USER_WITH_EXISTING_SESSION_IDENTIFIER);
        const decodedToken = jsonwebtoken.decode(token.replace('Bearer ', ''));
        expect(decodedToken.iat).toEqual(DATE_NOW_IN_UNIX_TIME);
        expect(decodedToken.exp).toEqual(DATE_NOW_IN_UNIX_TIME + SECONDS_IN_12_HOURS);
        expect(decodedToken.username).toEqual(USER.username);
        expect(decodedToken.loginStatus).toEqual(PORTAL_LOGIN_STATUS.VALID_2FA);
        expect(decodedToken.sessionIdentifier).toEqual(sessionIdentifier);
        expect(decodedToken.sessionIdentifier).toEqual(EXISTING_SESSION_IDENTIFIER);
        expect(decodedToken.roles).toEqual(USER.roles);
        expect(decodedToken.bank).toEqual(USER.bank);
      });

      it('should return the correct expiry time', () => {
        const { expires } = issueValid2faJWT(USER_WITH_EXISTING_SESSION_IDENTIFIER);
        expect(expires).toEqual('12h');
      });
    });

    function is32ByteHex(str) {
      return /^[0-9a-fA-F]{64}$/.test(str);
    }
  });
});
