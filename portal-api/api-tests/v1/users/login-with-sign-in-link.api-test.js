const { PORTAL_LOGIN_STATUS } = require('@ukef/dtfs2-common');
const app = require('../../../src/createApp');
const { mongoDbClient: db } = require('../../../src/drivers/db-client');
const { Hasher } = require('../../../src/crypto/hasher');
const { Pbkdf2Sha512HashStrategy } = require('../../../src/crypto/pbkdf2-sha512-hash-strategy');
const { CryptographicallyStrongGenerator } = require('../../../src/crypto/cryptographically-strong-generator');
const { as } = require('../../api')(app);
const { SIGN_IN_LINK, USER, HTTP_ERROR_CAUSES } = require('../../../src/constants');
const users = require('./test-data');
const { setUpApiTestUser } = require('../../api-test-users');
const databaseHelper = require('../../database-helper');
const { createPartiallyLoggedInUserSession } = require('../../../test-helpers/api-test-helpers/database/user-repository');
const { sanitizeUser } = require('../../../src/v1/users/sanitizeUserData');

const aMaker = users.barclaysBankMaker1;
const anotherMaker = users.barclaysBankMaker2;

describe('POST /users/:userId/sign-in-link/:signInToken/login', () => {
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

  let userToCreateOtherUsers;

  const userToCreateAsPartiallyLoggedIn = aMaker;

  let partiallyLoggedInUser;
  let partiallyLoggedInUserId;
  let partiallyLoggedInUserToken;

  const loginWithSignInLink = ({ userId, signInToken, userToken }) =>
    as({ token: userToken }).post().to(`/v1/users/${userId}/sign-in-link/${signInToken}/login`);

  const usersCollection = () => db.getCollection('users');

  beforeAll(async () => {
    // Not faking next tick is required for database interaction to work
    jest.useFakeTimers({
      doNotFake: ['nextTick'],
    });
    await databaseHelper.wipe(['users']);

    userToCreateOtherUsers = await setUpApiTestUser(as);

    const partiallyLoggedInUserResponse = await createUser(userToCreateAsPartiallyLoggedIn);
    partiallyLoggedInUser = partiallyLoggedInUserResponse.body.user;
    partiallyLoggedInUserId = partiallyLoggedInUser._id;
    ({ token: partiallyLoggedInUserToken } = await createPartiallyLoggedInUserSession(partiallyLoggedInUser));
  });

  beforeEach(async () => {
    await databaseHelper.unsetUserProperties({
      username: userToCreateAsPartiallyLoggedIn.username,
      properties: ['signInLinkSendCount', 'signInLinkSendDate', 'signInTokens', 'disabled'],
    });
    await databaseHelper.setUserProperties({
      username: userToCreateAsPartiallyLoggedIn.username,
      update: { 'user-status': USER.STATUS.ACTIVE },
    });

    jest.resetAllMocks();
  });
  afterAll(async () => {
    jest.useRealTimers();

    await databaseHelper.wipe(['users']);
  });

  describe('validation', () => {
    it('returns a 400 error if userId is not a valid ObjectID', async () => {
      const { status, body } = await loginWithSignInLink({
        userId: invalidUserId,
        signInToken: validSignInToken,
        userToken: partiallyLoggedInUserToken,
      });

      expect(status).toEqual(400);
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
      const { status, body } = await loginWithSignInLink({
        userId: partiallyLoggedInUserId,
        signInToken: invalidSignInToken,
        userToken: partiallyLoggedInUserToken,
      });

      expect(status).toEqual(400);
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
      const { status, body } = await loginWithSignInLink({
        userId: partiallyLoggedInUserId,
        signInToken: longSignInToken,
        userToken: partiallyLoggedInUserToken,
      });

      expect(status).toEqual(400);
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
      const { status, body } = await loginWithSignInLink({
        userId: partiallyLoggedInUserId,
        signInToken: shortSignInToken,
        userToken: partiallyLoggedInUserToken,
      });

      expect(status).toEqual(400);
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
      const { status, body } = await loginWithSignInLink({
        userId: partiallyLoggedInUserId,
        signInToken: shortNonHexadecimalString,
        userToken: partiallyLoggedInUserToken,
      });

      expect(status).toEqual(400);
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

  describe('when the userId does not match the logged in user', () => {
    const anotherUserToCreateAsPartiallyLoggedIn = anotherMaker;

    let anotherPartiallyLoggedInUser;
    let anotherPartiallyLoggedInUserToken;

    beforeAll(async () => {
      const anotherPartiallyLoggedInUserResponse = await createUser(anotherUserToCreateAsPartiallyLoggedIn);
      anotherPartiallyLoggedInUser = anotherPartiallyLoggedInUserResponse.body.user;
      ({ token: anotherPartiallyLoggedInUserToken } = await createPartiallyLoggedInUserSession(anotherPartiallyLoggedInUser));
    });

    it('returns a 400 error', async () => {
      const { status, body } = await loginWithSignInLink({
        userId: partiallyLoggedInUserId,
        signInToken: validSignInToken,
        userToken: anotherPartiallyLoggedInUserToken,
      });

      expect(status).toEqual(400);
      expect(body).toStrictEqual({
        message: 'Bad Request',
        errors: [
          {
            msg: `Invalid user id ${partiallyLoggedInUserId}`,
          },
        ],
      });
    });
  });

  describe('when the userId does match the logged in user', () => {
    describe('when the user does not have a sign in token saved', () => {
      it('returns a 404 error', async () => {
        const { status, body } = await loginWithSignInLink({
          userId: partiallyLoggedInUserId,
          signInToken: validSignInToken,
          userToken: partiallyLoggedInUserToken,
        });

        expect(status).toEqual(404);
        expect(body).toStrictEqual({
          message: 'Not Found',
          errors: [
            {
              msg: `No matching token for user with id ${partiallyLoggedInUserId}`,
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
            { _id: { $eq: userToCreateAsPartiallyLoggedIn._id } },
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
          const { status, body } = await loginWithSignInLink({
            userId: partiallyLoggedInUserId,
            signInToken: validSignInToken,
            userToken: partiallyLoggedInUserToken,
          });

          expect(status).toEqual(404);
          expect(body).toStrictEqual({
            message: 'Not Found',
            errors: [
              {
                msg: `No matching token for user with id ${partiallyLoggedInUserId}`,
              },
            ],
          });
        });
      });

      describe('when the sign in token does match the saved sign in token', () => {
        describe('when the user is blocked', () => {
          beforeEach(async () => {
            await databaseHelper.setUserProperties({
              username: userToCreateAsPartiallyLoggedIn.username,
              update: {
                'user-status': USER.STATUS.BLOCKED,
                signInTokens: [
                  {
                    saltHex: saltHexForValidSignInToken,
                    hashHex: hashHexForValidSignInToken,
                    expiry: Date.now() + 10000,
                  },
                ],
              },
            });
          });

          it('returns a user blocked 403 error', async () => {
            const { status, body } = await loginWithSignInLink({
              userId: partiallyLoggedInUserId,
              signInToken: validSignInToken,
              userToken: partiallyLoggedInUserToken,
            });
            expect(status).toEqual(403);
            expect(body).toStrictEqual({
              message: 'Forbidden',
              errors: [
                {
                  msg: `User blocked: ${partiallyLoggedInUserId}`,
                  cause: HTTP_ERROR_CAUSES.USER_BLOCKED,
                },
              ],
            });
          });
        });

        describe('when the user is disabled', () => {
          beforeEach(async () => {
            await databaseHelper.setUserProperties({
              username: userToCreateAsPartiallyLoggedIn.username,
              update: {
                disabled: true,
                signInTokens: [
                  {
                    saltHex: saltHexForValidSignInToken,
                    hashHex: hashHexForValidSignInToken,
                    expiry: Date.now() + 10000,
                  },
                ],
              },
            });
          });

          it('returns a user disabled 403 error', async () => {
            const { status, body } = await loginWithSignInLink({
              userId: partiallyLoggedInUserId,
              signInToken: validSignInToken,
              userToken: partiallyLoggedInUserToken,
            });
            expect(status).toEqual(403);
            expect(body).toStrictEqual({
              message: 'Forbidden',
              errors: [
                {
                  msg: `User disabled: ${partiallyLoggedInUserId}`,
                  cause: HTTP_ERROR_CAUSES.USER_DISABLED,
                },
              ],
            });
          });
        });

        describe('when the saved sign in token has expired', () => {
          beforeEach(async () => {
            await databaseHelper.setUserProperties({
              username: userToCreateAsPartiallyLoggedIn.username,
              update: {
                signInTokens: [
                  {
                    saltHex: saltHexForValidSignInToken,
                    hashHex: hashHexForValidSignInToken,
                    expiry: Date.now() - 1,
                  },
                ],
              },
            });
          });

          it('returns a token expired 403 error', async () => {
            const { status, body } = await loginWithSignInLink({
              userId: partiallyLoggedInUserId,
              signInToken: validSignInToken,
              userToken: partiallyLoggedInUserToken,
            });
            expect(status).toEqual(403);
            expect(body).toStrictEqual({
              message: 'Forbidden',
              errors: [
                {
                  msg: `The provided token is no longer valid for user with id ${partiallyLoggedInUserId}`,
                  cause: HTTP_ERROR_CAUSES.TOKEN_EXPIRED,
                },
              ],
            });
          });
        });

        describe('when the saved sign in token has expired and user is blocked', () => {
          beforeEach(async () => {
            await databaseHelper.setUserProperties({
              'user-status': USER.STATUS.BLOCKED,
              username: userToCreateAsPartiallyLoggedIn.username,
              update: {
                signInTokens: [
                  {
                    saltHex: saltHexForValidSignInToken,
                    hashHex: hashHexForValidSignInToken,
                    expiry: Date.now() - 1,
                  },
                ],
              },
            });
          });

          it('returns a token expired 403 error', async () => {
            const { status, body } = await loginWithSignInLink({
              userId: partiallyLoggedInUserId,
              signInToken: validSignInToken,
              userToken: partiallyLoggedInUserToken,
            });
            expect(status).toEqual(403);
            expect(body).toStrictEqual({
              message: 'Forbidden',
              errors: [
                {
                  msg: `The provided token is no longer valid for user with id ${partiallyLoggedInUserId}`,
                  cause: HTTP_ERROR_CAUSES.TOKEN_EXPIRED,
                },
              ],
            });
          });
        });

        describe('when the saved sign in token has not expired', () => {
          beforeEach(async () => {
            await databaseHelper.setUserProperties({
              username: userToCreateAsPartiallyLoggedIn.username,
              update: {
                signInTokens: [
                  {
                    saltHex: saltHexForValidSignInToken,
                    hashHex: hashHexForValidSignInToken,
                    expiry: Date.now(),
                  },
                ],
              },
            });
          });

          it('returns a 200 response with a valid JWT and the sanitised user details', async () => {
            const { status, body } = await loginWithSignInLink({
              userId: partiallyLoggedInUserId,
              signInToken: validSignInToken,
              userToken: partiallyLoggedInUserToken,
            });
            // lastLogin is removed as this will be the login prior to this login (in tests, this is undefined)
            const { lastLogin: _lastLogin, ...expectedSanitisedUser } = sanitizeUser(await databaseHelper.getUserById(partiallyLoggedInUserId));

            expect(status).toEqual(200);
            expect(body).toStrictEqual({
              success: true,
              token: expect.any(String),
              user: JSON.parse(JSON.stringify(expectedSanitisedUser)),
              loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
              expiresIn: '12h',
            });
          });

          it('deletes the saved sign in token for the user', async () => {
            await loginWithSignInLink({
              userId: partiallyLoggedInUserId,
              signInToken: validSignInToken,
              userToken: partiallyLoggedInUserToken,
            });

            const testUserInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
            expect(testUserInDb.signInTokens).toEqual(undefined);
          });
        });
      });
    });
  });

  async function createUser(userToCreate) {
    return as(userToCreateOtherUsers).post(userToCreate).to('/v1/users');
  }
});
