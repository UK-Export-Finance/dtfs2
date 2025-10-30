const { AxiosError } = require('axios');
const crypto = require('crypto');
const { PORTAL_USER_SALTS, PORTAL_USER_SIGN_IN_TOKENS, VALID_COMPUTED_HASH } = require('@ukef/dtfs2-common');
const databaseHelper = require('../../database-helper');
const { setUpApiTestUser } = require('../../api-test-users');
const sendEmail = require('../../../server/v1/email');
const { createUser } = require('../../helpers/create-user');
const app = require('../../../server/createApp');
const { as, post } = require('../../api')(app);
const users = require('./test-data');
const { withPartial2FaOnlyAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { SIGN_IN_LINK, USER, EMAIL_TEMPLATE_IDS } = require('../../../server/constants');
const { PORTAL_UI_URL } = require('../../../server/config/sign-in-link.config');
const { createPartiallyLoggedInUserSession, createLoggedInUserSession } = require('../../../test-helpers/api-test-helpers/database/user-repository');

const originalSignInLinkDurationMinutes = SIGN_IN_LINK.DURATION_MINUTES;
const maker1 = users.testBank1Maker1;
const maker2 = users.testBank1Maker2;

const url = '/v1/users/me/sign-in-link';

const hashHexOne = PORTAL_USER_SIGN_IN_TOKENS.VALID_FORMAT_SIGN_IN_TOKEN_ONE;
const hashHexTwo = PORTAL_USER_SIGN_IN_TOKENS.VALID_FORMAT_SIGN_IN_TOKEN_TWO;
const hashHexThree = PORTAL_USER_SIGN_IN_TOKENS.VALID_FORMAT_SIGN_IN_TOKEN_THREE;

const saltHexOne = PORTAL_USER_SALTS.VALID_FORMAT_SALT_ONE;
const saltHexTwo = PORTAL_USER_SALTS.VALID_FORMAT_SALT_TWO;
const saltHexThree = PORTAL_USER_SALTS.VALID_FORMAT_SALT_THREE;

const mockSalt = Buffer.from(saltHexOne, 'hex');

const temporaryUsernameAndEmail = 'temporary_user@ukexportfinance.gov.uk';
const userToCreateAsPartiallyLoggedIn = {
  ...maker1,
  username: temporaryUsernameAndEmail,
  email: temporaryUsernameAndEmail,
};
const userToCreateFullyLoggedIn = { ...maker2 };

jest.mock('../../../server/v1/email');
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomBytes: jest.fn().mockReturnValue(Buffer.from('bbb', 'hex')),
}));

describe('POST /users/me/sign-in-link', () => {
  let userToCreateOtherUsers;
  let partiallyLoggedInUser;
  let partiallyLoggedInUserId;
  let fullyLoggedInUser;
  let fullyLoggedInUserToken;
  let userToken;
  let partiallyLoggedInUserToken;
  let dateNow;
  let dateOneHourAgo;
  let dateTwelveHoursAgo;
  let dateOverTwelveHoursAgo;

  beforeAll(async () => {
    // Not faking next tick is required for test database interaction to work
    jest.useFakeTimers({ doNotFake: ['nextTick'] });
    dateNow = Date.now();
    const oneHourInMilliseconds = 60 * 60 * 1000;
    const twelveHoursInMilliseconds = 12 * oneHourInMilliseconds;

    dateTwelveHoursAgo = dateNow - twelveHoursInMilliseconds;
    dateOverTwelveHoursAgo = dateTwelveHoursAgo - 1;
    dateOneHourAgo = dateNow - oneHourInMilliseconds;

    await databaseHelper.wipe(['users']);

    userToCreateOtherUsers = await setUpApiTestUser(as);

    const fullyLoggedInUserResponse = await createUser(userToCreateFullyLoggedIn, userToCreateOtherUsers);
    fullyLoggedInUser = fullyLoggedInUserResponse.body.user;
    ({ token: fullyLoggedInUserToken } = await createLoggedInUserSession(fullyLoggedInUser));

    const partiallyLoggedInUserResponse = await createUser(userToCreateAsPartiallyLoggedIn, userToCreateOtherUsers);
    partiallyLoggedInUser = partiallyLoggedInUserResponse.body.user;
    partiallyLoggedInUserId = partiallyLoggedInUser._id;
    ({ token: partiallyLoggedInUserToken } = await createPartiallyLoggedInUserSession(partiallyLoggedInUser));
  });

  beforeEach(async () => {
    userToken = partiallyLoggedInUserToken;
    await databaseHelper.unsetUserProperties({
      username: temporaryUsernameAndEmail,
      properties: ['signInLinkSendCount', 'signInLinkSendDate', 'signInTokens', 'disabled'],
    });
    await databaseHelper.setUserProperties({
      username: temporaryUsernameAndEmail,
      update: { 'user-status': USER.STATUS.ACTIVE },
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.clearAllMocks();
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
        username: temporaryUsernameAndEmail,
        update: {
          'user-status': USER.STATUS.BLOCKED,
          signInLinkSendCount: initialSignInLinkSendCount,
          signInLinkSendDate: dateNow,
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
      expect(userInDb.signInLinkSendCount).toEqual(initialSignInLinkSendCount + 1);
    });

    it('does not email a new sign in link', async () => {
      await sendSignInLink();

      expect(sendEmail).not.toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.SIGN_IN_LINK, userToCreateAsPartiallyLoggedIn.email, expect.anything());
    });

    it('does not email a blocked user email', async () => {
      await sendSignInLink();

      expect(sendEmail).not.toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.BLOCKED, userToCreateAsPartiallyLoggedIn.email, expect.anything());
    });
  });

  describe('when user has already been disabled', () => {
    const initialSignInLinkSendCount = 1;

    beforeEach(async () => {
      databaseHelper.setUserProperties({
        username: temporaryUsernameAndEmail,
        update: { disabled: true, signInLinkSendCount: initialSignInLinkSendCount, signInLinkSendDate: dateNow },
      });
    });

    it('returns a 403 error response', async () => {
      const { status, body } = await sendSignInLink();
      expect403ErrorWithUserBlockedMessage({ status, body });
    });

    it('increments the signInLinkSendCount', async () => {
      await sendSignInLink();

      const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
      expect(userInDb.signInLinkSendCount).toEqual(initialSignInLinkSendCount + 1);
    });

    it('does not email a new sign in link', async () => {
      await sendSignInLink();

      expect(sendEmail).not.toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.SIGN_IN_LINK, userToCreateAsPartiallyLoggedIn.email, expect.anything());
    });

    it('does not email a blocked user email', async () => {
      await sendSignInLink();

      expect(sendEmail).not.toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.BLOCKED, userToCreateAsPartiallyLoggedIn.email, expect.anything());
    });
  });

  describe('when user has 3 sign in link send attempts ', () => {
    let signInTokensInDatabase;
    beforeEach(async () => {
      signInTokensInDatabase = [
        { hashHex: hashHexThree, saltHex: saltHexThree, expiry: dateOneHourAgo },
        { hashHex: hashHexTwo, saltHex: saltHexTwo, expiry: dateOneHourAgo },
        { hashHex: hashHexOne, saltHex: saltHexOne, expiry: dateNow },
      ];
      databaseHelper.setUserProperties({
        username: temporaryUsernameAndEmail,
        update: {
          signInLinkSendCount: 3,
          signInLinkSendDate: dateNow,
          signInTokens: signInTokensInDatabase,
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
      expect(userInDb.signInLinkSendCount).toEqual(4);
    });

    it('keeps any existing sign in token data', async () => {
      await sendSignInLink();

      const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
      expect(userInDb.signInTokens).toStrictEqual(signInTokensInDatabase);
    });

    it('does not email a new sign in link', async () => {
      await sendSignInLink();

      expect(sendEmail).not.toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.SIGN_IN_LINK, userToCreateAsPartiallyLoggedIn.email, expect.anything());
    });

    it('emails a blocked user email', async () => {
      await sendSignInLink();

      expect(sendEmail).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.BLOCKED, userToCreateAsPartiallyLoggedIn.email, expect.anything());
    });
  });

  describe('when user has remaining attempts', () => {
    describe('when creating the sign in token errors', () => {
      beforeEach(() => {
        jest.spyOn(crypto, 'randomBytes').mockImplementationOnce(() => {
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
        jest.spyOn(crypto, 'randomBytes').mockImplementationOnce(() => mockSalt);
      });

      describe('when creating the sign in salt errors', () => {
        beforeEach(() => {
          jest.spyOn(crypto, 'randomBytes').mockImplementationOnce(() => {
            throw new Error();
          });
        });

        it('returns a 500 error response', async () => {
          // Act
          const { status, body } = await sendSignInLink();

          // Assert
          expect500ErrorWithFailedToSaveCodeMessage({ status, body });
        });
      });

      describe('when creating the sign in salt succeeds', () => {
        beforeEach(() => {
          jest.spyOn(crypto, 'randomBytes').mockImplementationOnce(() => mockSalt);
        });

        describe('when creating the sign in hash errors', () => {
          beforeEach(() => {
            jest.spyOn(crypto, 'pbkdf2Sync').mockImplementationOnce(() => {
              throw new Error();
            });
          });

          it('returns a 500 error response', async () => {
            // Act
            const { status, body } = await sendSignInLink();

            // Assert
            expect500ErrorWithFailedToSaveCodeMessage({ status, body });
          });
        });

        describe('when creating the sign in hash succeeds', () => {
          let newSignInToken;

          beforeEach(() => {
            newSignInToken = {
              saltHex: saltHexOne,
              hashHex: VALID_COMPUTED_HASH,
              expiry: dateNow + SIGN_IN_LINK.DURATION_MILLISECONDS,
            };

            SIGN_IN_LINK.DURATION_MINUTES = originalSignInLinkDurationMinutes;
          });

          it('saves the sign in token with hash, salt and expiry in the database', async () => {
            await sendSignInLink();

            const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
            const { signInTokens } = userInDb;

            expect(signInTokens[0]).toEqual(newSignInToken);
          });

          it('sends a sign in link email to the user', async () => {
            SIGN_IN_LINK.DURATION_MINUTES = 2;
            await sendSignInLink();

            expect(sendEmail).toHaveBeenCalledWith('2eab0ad2-eb92-43a4-b04c-483c28a4da18', partiallyLoggedInUser.email, {
              firstName: partiallyLoggedInUser.firstname,
              lastName: partiallyLoggedInUser.surname,
              signInLink: `${PORTAL_UI_URL}/login/sign-in-link?t=${saltHexOne}&u=${partiallyLoggedInUser._id}`,
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

              expect(status).toEqual(201);
            });

            it('increments the signInLinkSendCount', async () => {
              await sendSignInLink();

              const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
              expect(userInDb.signInLinkSendCount).toEqual(1);
            });

            describe('when the user has not been sent a sign in link before', () => {
              beforeEach(async () => {
                await databaseHelper.unsetUserProperties({
                  username: temporaryUsernameAndEmail,
                  properties: ['signInLinkSendCount', 'signInLinkSendDate', 'signInTokens'],
                });
              });

              it('updates the signInLinkSendDate', async () => {
                await sendSignInLink();

                const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
                expect(userInDb.signInLinkSendDate).toEqual(dateNow);
              });

              it('increments the signInLinkSendCount', async () => {
                await sendSignInLink();

                const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
                expect(userInDb.signInLinkSendCount).toEqual(1);
              });

              it('adds the hashHexOne to the end of saved signInTokens array', async () => {
                await sendSignInLink();

                const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
                expect(userInDb.signInTokens).toStrictEqual([
                  { saltHex: saltHexOne, hashHex: VALID_COMPUTED_HASH, expiry: dateNow + SIGN_IN_LINK.DURATION_MILLISECONDS },
                ]);
              });
            });

            describe('when the user has been sent a sign in link before', () => {
              describe('when a link has been sent in the last 12hrs', () => {
                const initialSignInLinkSendCount = 1;
                let existingSignInTokens;

                beforeEach(async () => {
                  existingSignInTokens = [
                    { hashHex: hashHexThree, saltHex: saltHexThree, expiry: dateTwelveHoursAgo },
                    { hashHex: hashHexTwo, saltHex: saltHexTwo, expiry: dateOneHourAgo },
                  ];

                  await databaseHelper.setUserProperties({
                    username: temporaryUsernameAndEmail,
                    update: {
                      signInLinkSendCount: initialSignInLinkSendCount,
                      signInLinkSendDate: dateTwelveHoursAgo,
                      signInTokens: existingSignInTokens,
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
                  expect(userInDb.signInLinkSendCount).toEqual(initialSignInLinkSendCount + 1);
                });

                it('adds the hashHexOne to the end of saved signInTokens array', async () => {
                  await sendSignInLink();

                  const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
                  expect(userInDb.signInTokens).toStrictEqual([
                    ...existingSignInTokens,
                    { saltHex: saltHexOne, hashHex: VALID_COMPUTED_HASH, expiry: dateNow + SIGN_IN_LINK.DURATION_MILLISECONDS },
                  ]);
                });
              });

              describe('when a link has not been sent in the last 12hrs', () => {
                beforeEach(async () => {
                  await databaseHelper.setUserProperties({
                    username: temporaryUsernameAndEmail,
                    update: {
                      signInLinkSendCount: 2,
                      signInLinkSendDate: dateOverTwelveHoursAgo,
                      signInTokens: [
                        { hashHex: hashHexThree, saltHex: saltHexThree, expiry: dateOverTwelveHoursAgo },
                        { hashHex: hashHexTwo, saltHex: saltHexTwo, expiry: dateOverTwelveHoursAgo },
                      ],
                    },
                  });
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

                it('deletes any existing sign in token data', async () => {
                  await sendSignInLink();

                  const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
                  const { signInTokens } = userInDb;

                  const hasSignInTokenTwo = signInTokens.some(({ hashHex }) => hashHex === hashHexThree);
                  const hasSignInTokenThree = signInTokens.some(({ hashHex }) => hashHex === hashHexTwo);

                  expect(hasSignInTokenTwo).toEqual(false);
                  expect(hasSignInTokenThree).toEqual(false);
                });

                it('adds the hashHexOne to the end of saved signInTokens array', async () => {
                  await sendSignInLink();

                  const userInDb = await databaseHelper.getUserById(partiallyLoggedInUserId);
                  expect(userInDb.signInTokens).toStrictEqual([
                    { saltHex: saltHexOne, hashHex: VALID_COMPUTED_HASH, expiry: dateNow + SIGN_IN_LINK.DURATION_MILLISECONDS },
                  ]);
                });
              });
            });
          });
        });
      });
    });
  });

  function expect403ErrorWithUserBlockedMessage({ status, body }) {
    expect(status).toEqual(403);
    expect(body).toStrictEqual({
      error: 'Forbidden',
      message: `User blocked: ${partiallyLoggedInUserId}`,
    });
  }
  function expect500ErrorWithFailedToCreateCodeMessage({ status, body }) {
    expect(status).toEqual(500);
    expect(body).toStrictEqual({
      error: 'Internal Server Error',
      message: 'Failed to create a sign in token',
    });
  }

  function expect500ErrorWithFailedToSaveCodeMessage({ status, body }) {
    expect(status).toEqual(500);
    expect(body).toStrictEqual({
      error: 'Internal Server Error',
      message: 'Failed to save the sign in token',
    });
  }

  function expect500ErrorWithFailedToSendEmailMessage({ status, body }) {
    expect(status).toEqual(500);
    expect(body).toStrictEqual({
      error: 'Internal Server Error',
      message: 'Failed to email the sign in token',
    });
  }
});
