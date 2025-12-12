const { produce } = require('immer');
const { TEST_DATABASE_USER } = require('../../../test-helpers/unit-test-mocks/mock-user');
const { transformDatabaseUser } = require('./transform-database-user');

describe('transformDatabaseUser', () => {
  describe('signinTokens transformations', () => {
    describe('with one sign in token', () => {
      const userWithOneSignInToken = produce(TEST_DATABASE_USER, (draft) => {
        draft.signInTokens = [TEST_DATABASE_USER.signInTokens[0]];
      });
      assertSignInTokensAreTurnedToHexAndOriginalTokensDeleted(userWithOneSignInToken);
    });

    describe('with multiple sign in tokens', () => {
      const userWithTwoSignInTokens = { ...TEST_DATABASE_USER };
      assertSignInTokensAreTurnedToHexAndOriginalTokensDeleted(userWithTwoSignInTokens);
    });

    describe('with no sign in tokens', () => {
      it('returns the user without the signInToken field if it does not exist in the database user', () => {
        const userWithoutSignInToken = { ...TEST_DATABASE_USER };
        delete userWithoutSignInToken.signInTokens;

        const result = transformDatabaseUser(userWithoutSignInToken);

        expect(result.signInTokens).toBeUndefined();
      });
    });

    function assertSignInTokensAreTurnedToHexAndOriginalTokensDeleted(userInDatabase) {
      it('returns the user with every signInTokens hashes and salts as Buffers', () => {
        const databaseSignInTokens = userInDatabase.signInTokens;

        const result = transformDatabaseUser(userInDatabase);
        result.signInTokens.forEach((signInToken, i) => {
          const databaseSignInToken = databaseSignInTokens[i];
          expect(signInToken.salt).toEqual(Buffer.from(databaseSignInToken.saltHex, 'hex'));
          expect(signInToken.hash).toEqual(Buffer.from(databaseSignInToken.hashHex, 'hex'));
          expect(signInToken.expiry).toEqual(databaseSignInToken.expiry);
        });
      });

      it('returns the user without every signInTokens hashHex and saltHex', () => {
        const result = transformDatabaseUser(userInDatabase);
        result.signInTokens.forEach((signInToken) => {
          expect(signInToken.hashHex).toBeUndefined();
          expect(signInToken.saltHex).toBeUndefined();
        });
      });
    }
  });
});
