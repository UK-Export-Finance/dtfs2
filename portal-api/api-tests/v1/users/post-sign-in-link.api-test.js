jest.mock('../../../src/v1/email');

jest.mock('node:crypto', () => ({
  ...jest.requireActual('node:crypto'),
  pbkdf2Sync: jest.fn(),
  randomBytes: jest.fn(),
}));

const { ObjectId } = require('mongodb');
const { when, resetAllWhenMocks } = require('jest-when');
const { pbkdf2Sync, randomBytes } = require('node:crypto');
const { AxiosError } = require('axios');
const db = require('../../../src/drivers/db-client');
const databaseHelper = require('../../database-helper');
const { setUpApiTestUser } = require('../../api-test-users');
const sendEmail = require('../../../src/v1/email');

const app = require('../../../src/createApp');
const { as, post } = require('../../api')(app);
const users = require('./test-data');
const { withPartial2FaOnlyAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { SIGN_IN_LINK_DURATION, USER } = require('../../../src/constants');
const { PORTAL_UI_URL } = require('../../../src/config/sign-in-link.config');
const { createPartiallyLoggedInUserSession, createLoggedInUserSession } = require('../../../test-helpers/api-test-helpers/database/user-repository');

const originalSignInLinkDurationMinutes = SIGN_IN_LINK_DURATION.MINUTES;

const aMaker = users.find((user) => user.username === 'MAKER');
const anotherMaker = users.find((user) => user.username === 'MAKER-2');

describe('POST /users/me/sign-in-link', () => {
  const url = '/v1/users/me/sign-in-link';
  const hash = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const salt = 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';
  const saltBytes = Buffer.from(salt, 'hex');
  const signInToken = '0a1b2c3d4e5f67890a1b2c3d4e5f6789';
  const username = 'TEMPORARY_USER';
  const userToCreateAsPartiallyLoggedIn = { ...aMaker, username };
  const userToCreateFullyLoggedIn = { ...anotherMaker };

  let userToCreateOtherUsers;
  let partiallyLoggedInUser;
  let partiallyLoggedInUserId;
  let fullyLoggedInUser;
  let fullyLoggedInUserToken;
  let userToken;
  let partiallyLoggedInUserToken;
  let dateNow;
  let dateTwelveHoursAgo;
  let dateOverTwelveHoursAgo;

  beforeAll(async () => {
    // Not faking next tick is required for test database interaction to work
    jest.useFakeTimers({ doNotFake: ['nextTick'] });
    dateNow = Date.now();
    const twelveHoursInMilliseconds = 12 * 60 * 60 * 1000;
    dateTwelveHoursAgo = dateNow - twelveHoursInMilliseconds;
    dateOverTwelveHoursAgo = dateTwelveHoursAgo - 1;

    await databaseHelper.wipe(['users']);

    userToCreateOtherUsers = await setUpApiTestUser(as);

    const fullyLoggedInUserResponse = await createUser(userToCreateFullyLoggedIn);
    fullyLoggedInUser = fullyLoggedInUserResponse.body.user;
    ({ token: fullyLoggedInUserToken } = await createLoggedInUserSession(fullyLoggedInUser));

    const partiallyLoggedInUserResponse = await createUser(userToCreateAsPartiallyLoggedIn);
    partiallyLoggedInUser = partiallyLoggedInUserResponse.body.user;
    partiallyLoggedInUserId = partiallyLoggedInUser._id;
    ({ token: partiallyLoggedInUserToken } = await createPartiallyLoggedInUserSession(partiallyLoggedInUser));
  });

  beforeEach(async () => {
    userToken = partiallyLoggedInUserToken;
    await databaseHelper.unsetUserProperties({ username, properties: ['signInLinkSendCount', 'signInLinkSendDate'] });
    await databaseHelper.setUserProperties({ username, update: { 'user-status': USER.STATUS.ACTIVE } });

    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  afterAll(async () => {
    jest.useRealTimers();
  });

  withPartial2FaOnlyAuthenticationTests({
    makeRequestWithoutAuthHeader: () => post(url, {}),
    makeRequestWithAuthHeader: (authHeader) => post(url, {}, { headers: { Authorization: authHeader } }),
    get2faCompletedUserToken: () => fullyLoggedInUserToken,
  });

  const sendSignInLink = () => as({ token: userToken }).post().to(url);

  describe('when user has already been blocked', () => {
    const initialSignInLinkSendCount = 4;
    beforeEach(async () => {
      databaseHelper.setUserProperties({
        username,
        update: { 'user-status': USER.STATUS.BLOCKED, signInLinkSendCount: initialSignInLinkSendCount, signInLinkSendDate: Date.now() },
      });
    });

    it('returns a 403 error response', async () => {
      const { status, body } = await sendSignInLink();
      expect403ErrorWithUserBlockedMessage({ status, body });
    });

    it('increments the signInLinkSendCount', async () => {
      await sendSignInLink();

      const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
      expect(userInDb.signInLinkSendCount).toBe(initialSignInLinkSendCount + 1);
    });
  });

  describe('when user has 3 sign in link send attempts ', () => {
    beforeEach(async () => {
      databaseHelper.setUserProperties({
        username,
        update: {
          signInLinkSendCount: 3,
          signInLinkSendDate: Date.now(),
          signInToken: { hash, salt },
        },
      });
    });

    it('returns a 403 error response', async () => {
      const { status, body } = await sendSignInLink();
      expect403ErrorWithUserBlockedMessage({ status, body });
    });

    it('increments the signInLinkSendCount', async () => {
      await sendSignInLink();

      const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
      expect(userInDb.signInLinkSendCount).toBe(4);
    });

    it('deletes any existing sign in token data', async () => {
      await sendSignInLink();

      const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
      expect(userInDb.signInToken).toBeUndefined();
    });
  });

  describe('when user has remaining attempts', () => {
    describe('when creating the sign in token errors', () => {
      beforeEach(() => {
        when(randomBytes)
          .calledWith(32)
          .mockImplementationOnce(() => {
            throw new Error();
          });
      });

      it('returns a 500 error response', async () => {
        const { status, body } = await sendSignInLink();
        expect500ErrorWithFailedToCreateCodeMessage({ status, body });
      });
    });

    describe('when creating the sign in token succeeds', () => {
      beforeEach(() => {
        when(randomBytes).calledWith(32).mockReturnValueOnce(Buffer.from(signInToken, 'hex'));
      });

      describe('when creating the sign in salt errors', () => {
        beforeEach(() => {
          when(randomBytes)
            .calledWith(64)
            .mockImplementationOnce(() => {
              throw new Error();
            });
        });

        it('returns a 500 error response', async () => {
          const { status, body } = await sendSignInLink();
          expect500ErrorWithFailedToSaveCodeMessage({ status, body });
        });
      });

      describe('when creating the sign in salt succeeds', () => {
        beforeEach(() => {
          when(randomBytes).calledWith(64).mockReturnValueOnce(saltBytes);
        });

        describe('when creating the sign in hash errors', () => {
          beforeEach(() => {
            when(pbkdf2Sync)
              .calledWith(signInToken, saltBytes, 210000, 64, 'sha512')
              .mockImplementationOnce(() => {
                throw new Error();
              });
          });

          it('returns a 500 error response', async () => {
            const { status, body } = await sendSignInLink();
            expect500ErrorWithFailedToSaveCodeMessage({ status, body });
          });
        });

        describe('when creating the sign in hash succeeds', () => {
          beforeEach(() => {
            when(pbkdf2Sync).calledWith(signInToken, saltBytes, 210000, 64, 'sha512').mockReturnValueOnce(Buffer.from(hash, 'hex'));
          });

          afterEach(() => {
            SIGN_IN_LINK_DURATION.MINUTES = originalSignInLinkDurationMinutes;
          });

          it('saves the sign in hash and salt in the database as hex', async () => {
            await sendSignInLink();

            const userInDb = await (await db.getCollection('users')).findOne({ _id: { $eq: ObjectId(partiallyLoggedInUserId) } });
            const {
              signInToken: { hashHex: signInHash, saltHex: signInSalt },
            } = userInDb;
            expect(signInHash).toBe(hash);
            expect(signInSalt).toBe(salt);
          });

          it('sends a sign in link email to the user', async () => {
            SIGN_IN_LINK_DURATION.MINUTES = 2;
            await sendSignInLink();

            expect(sendEmail).toHaveBeenCalledWith('2eab0ad2-eb92-43a4-b04c-483c28a4da18', partiallyLoggedInUser.email, {
              firstName: partiallyLoggedInUser.firstname,
              lastName: partiallyLoggedInUser.surname,
              signInLink: `${PORTAL_UI_URL}/login/sign-in-link?t=${signInToken}&u=${partiallyLoggedInUser._id}`,
              signInLinkDuration: '2 minutes',
            });
          });

          describe('when sending the sign in link email to the user fails', () => {
            beforeEach(() => {
              sendEmail.mockRejectedValueOnce(new AxiosError());
            });

            it('should return a 500 error', async () => {
              const { status, body } = await sendSignInLink();
              expect500ErrorWithFailedToSendEmailMessage({ status, body });
            });
          });

          describe('when sending the sign in link email to the user succeeds', () => {
            beforeEach(() => {
              sendEmail.mockResolvedValueOnce({ status: 201 });
            });

            it('should return a 201 response', async () => {
              const { status } = await sendSignInLink();

              expect(status).toBe(201);
            });

            it('increments the signInLinkSendCount', async () => {
              await sendSignInLink();

              const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
              expect(userInDb.signInLinkSendCount).toBe(1);
            });

            describe('when the user has not been sent a sign in link before', () => {
              beforeEach(async () => {
                await databaseHelper.unsetUserProperties({ username, properties: ['signInLinkSendCount', 'signInLinkSendDate'] });
              });

              it('updates the signInLinkSendDate', async () => {
                await sendSignInLink();

                const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
                expect(userInDb.signInLinkSendDate).toEqual(dateNow);
              });

              it('increments the signInLinkSendCount', async () => {
                await sendSignInLink();

                const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
                expect(userInDb.signInLinkSendCount).toBe(1);
              });
            });

            describe('when the user has been sent a sign in link before', () => {
              describe('when a link has been sent in the last 12hrs', () => {
                const initialSignInLinkSendCount = 1;

                beforeEach(async () => {
                  await databaseHelper.setUserProperties({
                    username,
                    update: {
                      signInLinkSendCount: initialSignInLinkSendCount,
                      signInLinkSendDate: dateTwelveHoursAgo,
                    },
                  });
                });

                it('does not update the signInLinkSendDate', async () => {
                  await sendSignInLink();

                  const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
                  expect(userInDb.signInLinkSendDate).toEqual(dateTwelveHoursAgo);
                });

                it('increments the signInLinkSendCount', async () => {
                  await sendSignInLink();

                  const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
                  expect(userInDb.signInLinkSendCount).toBe(initialSignInLinkSendCount + 1);
                });
              });

              describe('when a link has not been sent in the last 12hrs', () => {
                beforeEach(async () => {
                  await databaseHelper.setUserProperties({ username, update: { signInLinkSendCount: 2, signInLinkSendDate: dateOverTwelveHoursAgo } });
                });

                it('updates the signInLinkSendDate', async () => {
                  await sendSignInLink();

                  const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
                  expect(userInDb.signInLinkSendDate).toEqual(dateNow);
                });

                it('resets the signInLinkSendCount', async () => {
                  await sendSignInLink();

                  const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
                  expect(userInDb.signInLinkSendCount).toEqual(1);
                });
              });
            });
          });
        });
      });
    });
  });

  function expect403ErrorWithUserBlockedMessage({ status, body }) {
    expect(status).toBe(403);
    expect(body).toStrictEqual({
      error: 'Forbidden',
      message: `User blocked: ${partiallyLoggedInUserId}`,
    });
  }
  function expect500ErrorWithFailedToCreateCodeMessage({ status, body }) {
    expect(status).toBe(500);
    expect(body).toStrictEqual({
      error: 'Internal Server Error',
      message: 'Failed to create a sign in token.',
    });
  }

  function expect500ErrorWithFailedToSaveCodeMessage({ status, body }) {
    expect(status).toBe(500);
    expect(body).toStrictEqual({
      error: 'Internal Server Error',
      message: 'Failed to save the sign in token.',
    });
  }

  function expect500ErrorWithFailedToSendEmailMessage({ status, body }) {
    expect(status).toBe(500);
    expect(body).toStrictEqual({
      error: 'Internal Server Error',
      message: 'Failed to email the sign in token.',
    });
  }

  async function createUser(userToCreate) {
    return as(userToCreateOtherUsers).post(userToCreate).to('/v1/users');
  }
});
