const { TEST_DATABASE_USER } = require('../../../test-helpers/unit-test-mocks/mock-user');

const transformDatabaseUser = (user) => {
  const userToReturn = { ...user };
  if (userToReturn.signInToken) {
    const { hashHex, saltHex } = userToReturn.signInToken;
    userToReturn.signInToken = {
      hash: Buffer.from(hashHex, 'hex'),
      salt: Buffer.from(saltHex, 'hex'),
    };
    delete userToReturn.signInToken.hashHex;
    delete userToReturn.signInToken.saltHex;
  }
  return userToReturn;
};

describe('transformDatabaseUser', () => {
  describe('signinToken transformations', () => {
    it('returns the user with the signInToken hash and salt as Buffers', () => {
      const { saltHex, hashHex } = TEST_DATABASE_USER.signInToken;

      const result = transformDatabaseUser(TEST_DATABASE_USER);

      expect(result.signInToken.salt).toEqual(Buffer.from(saltHex, 'hex'));
      expect(result.signInToken.hash).toEqual(Buffer.from(hashHex, 'hex'));
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
