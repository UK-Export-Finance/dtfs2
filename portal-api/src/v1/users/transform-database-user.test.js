const { TEST_DATABASE_USER } = require('../../../test-helpers/unit-test-mocks/mock-user');
const { transformDatabaseUser } = require('./transform-database-user');

describe('transformDatabaseUser', () => {
  describe('signinToken transformations', () => {
    it('returns the user with the signInToken hash and salt as Buffers', () => {
      const { saltHex, hashHex, expiry } = TEST_DATABASE_USER.signInToken;

      const result = transformDatabaseUser(TEST_DATABASE_USER);

      expect(result.signInToken.salt).toEqual(Buffer.from(saltHex, 'hex'));
      expect(result.signInToken.hash).toEqual(Buffer.from(hashHex, 'hex'));
      expect(result.signInToken.expiry).toEqual(expiry);
      
    });

    it('returns the user without the signInToken hashHex and saltHex', () => {
      const result = transformDatabaseUser(TEST_DATABASE_USER);

      expect(result.signInToken.hashHex).toBeUndefined();
      expect(result.signInToken.saltHex).toBeUndefined();
    });

    it('returns the user without the signInToken field if it does not exist in the database user', () => {
      const userWithoutSignInToken = { ...TEST_DATABASE_USER };
      delete userWithoutSignInToken.signInToken;

      const result = transformDatabaseUser(userWithoutSignInToken);

      expect(result.signInToken).toBeUndefined();
    });
  });
});
