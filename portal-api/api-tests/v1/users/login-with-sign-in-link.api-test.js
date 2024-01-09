const { ObjectId } = require('mongodb');
const app = require('../../../src/createApp');
const { getCollection } = require('../../../src/drivers/db-client');
const { Hasher } = require('../../../src/crypto/hasher');
const { Pbkdf2Sha512HashStrategy } = require('../../../src/crypto/pbkdf2-sha512-hash-strategy');
const { CryptographicallyStrongGenerator } = require('../../../src/crypto/cryptographically-strong-generator');
const { post } = require('../../api')(app);
const { LOGIN_STATUSES, SIGN_IN_LINK } = require('../../../src/constants');
const { withApiKeyAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { STATUS } = require('../../../src/constants/user');

describe('POST /users/:userId/sign-in-link/:signInToken/login', () => {
  const testUserId = '65626dc0bda51f77a78b86ae';
  const invalidUserId = '1';
  const validSignInToken = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const shortSignInToken = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde';
  const longSignInToken = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0';
  const invalidSignInToken = 'thisIsASixtyFourCharacterLengthTesterStringThatIsNotHexadecimal.';
  const thirtyMinutesInMilliseconds = 30 * 60 * 1000;

  const hasher = new Hasher(new Pbkdf2Sha512HashStrategy(new CryptographicallyStrongGenerator()));
  const hashedValidSignInToken = hasher.hash(validSignInToken);
  const saltHexForValidSignInToken = hashedValidSignInToken.salt.toString('hex');
  const hashHexForValidSignInToken = hashedValidSignInToken.hash.toString('hex');
  const nonMatchingHashHex = hasher.hash('test string').hash.toString('hex');

  const testUser = {
    _id: new ObjectId(testUserId),
    'user-status': STATUS.ACTIVE,
    salt: 'abc',
    hash: 'def',
    username: 'api-test-user',
    firstname: 'API Test',
    surname: 'User',
    email: 'api-test-user@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: ['read-only'],
    bank: {
      id: '*',
    },
    sessionIdentifier: 'a-session',
  };

  const login = ({ userId, signInToken }, headers = { 'x-api-key': process.env.PORTAL_API_KEY }) =>
    post(`/v1/users/${userId}/sign-in-link/${signInToken}/login`, undefined, { headers });

  const usersCollection = () => getCollection('users');

  withApiKeyAuthenticationTests({
    makeRequestWithHeaders: (headers) => login({ userId: testUserId, signInToken: validSignInToken }, headers),
  });

  describe('validation', () => {
    it('returns a 400 error if userId is not a valid ObjectID', async () => {
      const { status, body } = await login({ userId: invalidUserId, signInToken: validSignInToken });

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        message: 'Bad Request',
        errors: [
          {
            location: 'params',
            msg: 'Value must be a valid MongoId',
            path: 'userId',
            type: 'field',
            value: invalidUserId,
          },
        ],
      });
    });

    it('returns a 400 error if signInToken is not a valid hex string', async () => {
      const { status, body } = await login({ userId: testUserId, signInToken: invalidSignInToken });

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        message: 'Bad Request',
        errors: [
          {
            location: 'params',
            msg: 'Value must be a hexadecimal string',
            path: 'signInToken',
            type: 'field',
            value: invalidSignInToken,
          },
        ],
      });
    });

    it('returns a 400 error if signInToken is too long', async () => {
      const { status, body } = await login({ userId: testUserId, signInToken: longSignInToken });

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        message: 'Bad Request',
        errors: [
          {
            location: 'params',
            msg: `Value must be ${SIGN_IN_LINK.TOKEN_HEX_LENGTH} characters long`,
            path: 'signInToken',
            type: 'field',
            value: longSignInToken,
          },
        ],
      });
    });

    it('returns a 400 error if signInToken is too short', async () => {
      const { status, body } = await login({ userId: testUserId, signInToken: shortSignInToken });

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        message: 'Bad Request',
        errors: [
          {
            location: 'params',
            msg: `Value must be ${SIGN_IN_LINK.TOKEN_HEX_LENGTH} characters long`,
            path: 'signInToken',
            type: 'field',
            value: shortSignInToken,
          },
        ],
      });
    });

    it('returns a 400 error if there are multiple errors', async () => {
      const shortNonHexadecimalString = 'NotHexAndShort';
      const { status, body } = await login({ userId: testUserId, signInToken: shortNonHexadecimalString });

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        message: 'Bad Request',
        errors: [
          {
            location: 'params',
            msg: 'Value must be a hexadecimal string',
            path: 'signInToken',
            type: 'field',
            value: shortNonHexadecimalString,
          },
          {
            location: 'params',
            msg: `Value must be ${SIGN_IN_LINK.TOKEN_HEX_LENGTH} characters long`,
            path: 'signInToken',
            type: 'field',
            value: shortNonHexadecimalString,
          },
        ],
      });
    });
  });

  describe('when the userId does not match an existing user', () => {
    it('returns a 404 error', async () => {
      const { status, body } = await login({ userId: testUserId, signInToken: validSignInToken });

      expect(status).toBe(404);
      expect(body).toStrictEqual({
        message: 'Not Found',
        errors: [
          {
            msg: `No user found with id ${testUserId}`,
          },
        ],
      });
    });
  });

  describe('when the userId does match an existing user', () => {
    beforeEach(async () => {
      await (await usersCollection()).insertOne(testUser);
    });

    afterEach(async () => {
      await (
        await usersCollection()
      ).deleteOne({
        _id: { $eq: testUser._id },
      });
    });

    describe('when the user does not have a sign in token saved', () => {
      it('returns a 404 error', async () => {
        const { status, body } = await login({ userId: testUserId, signInToken: validSignInToken });

        expect(status).toBe(404);
        expect(body).toStrictEqual({
          message: 'Not Found',
          errors: [
            {
              msg: `No matching token for user with id ${testUserId}`,
            },
          ],
        });
      });
    });

    describe('when the user has a sign in token saved', () => {
      describe('when the signInToken does not match the saved sign in token', () => {
        beforeEach(async () => {
          await (
            await usersCollection()
          ).updateOne(
            { _id: { $eq: testUser._id } },
            {
              $set: {
                signInTokens: [
                  {
                    saltHex: saltHexForValidSignInToken,
                    hashHex: nonMatchingHashHex,
                    expiry: Date.now() + thirtyMinutesInMilliseconds,
                  },
                ],
              },
            },
          );
        });

        it('returns a 404 error', async () => {
          const { status, body } = await login({ userId: testUserId, signInToken: validSignInToken });

          expect(status).toBe(404);
          expect(body).toStrictEqual({
            message: 'Not Found',
            errors: [
              {
                msg: `No matching token for user with id ${testUserId}`,
              },
            ],
          });
        });
      });

      describe('when the signInToken does match the saved sign in token', () => {
        describe('when the saved sign in token has expired', () => {
          beforeEach(async () => {
            await (
              await usersCollection()
            ).updateOne(
              { _id: { $eq: testUser._id } },
              {
                $set: {
                  signInTokens: [
                    {
                      saltHex: saltHexForValidSignInToken,
                      hashHex: hashHexForValidSignInToken,
                      expiry: Date.now() - 1,
                    },
                  ],
                },
              },
            );
          });

          it('returns a 403 error', async () => {
            const { status, body } = await login({ userId: testUserId, signInToken: validSignInToken });

            expect(status).toBe(403);
            expect(body).toStrictEqual({
              message: 'Forbidden',
              errors: [
                {
                  msg: `The provided token is no longer valid for user with id ${testUserId}`,
                },
              ],
            });
          });
        });

        describe('when the saved sign in token has not expired', () => {
          beforeEach(async () => {
            // Not faking next tick is required for database interaction to work
            jest.useFakeTimers({
              doNotFake: ['nextTick'],
            });
            await (
              await usersCollection()
            ).updateOne(
              { _id: { $eq: testUser._id } },
              {
                $set: {
                  signInTokens: [
                    {
                      saltHex: saltHexForValidSignInToken,
                      hashHex: hashHexForValidSignInToken,
                      expiry: Date.now(),
                    },
                  ],
                },
              },
            );
          });

          afterEach(() => {
            jest.useRealTimers();
          });

          it('returns a 200 response with a valid JWT and the sanitised user details', async () => {
            const { hash, salt, sessionIdentifier, ...testUserWithoutSensitiveFields } = testUser;

            const { status, body } = await login({ userId: testUserId, signInToken: validSignInToken });

            expect(status).toEqual(200);
            expect(body).toStrictEqual({
              success: true,
              token: expect.any(String),
              user: JSON.parse(JSON.stringify(testUserWithoutSensitiveFields)),
              loginStatus: LOGIN_STATUSES.VALID_2FA,
              expiresIn: '12h',
            });
          });

          it('deletes the saved sign in token for the user', async () => {
            await login({ userId: testUserId, signInToken: validSignInToken });

            const testUserInDb = await (await usersCollection()).findOne({ _id: { $eq: testUser._id } });
            expect(testUserInDb.signInToken).toBe(undefined);
          });
        });
      });
    });
  });
});
