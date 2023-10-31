const { ObjectId } = require('mongodb');
const { when } = require('jest-when');
const { pbkdf2Sync, randomBytes } = require('node:crypto');
const { AxiosError } = require('axios');
const db = require('../../../src/drivers/db-client');
const wipeDB = require('../../wipeDB');
const { setUpApiTestUser } = require('../../api-test-users');
const sendEmail = require('../../../src/v1/email');

const app = require('../../../src/createApp');
const { as, post } = require('../../api')(app);
const users = require('./test-data');
const { withPartial2FaOnlyAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { SIGN_IN_LINK_EXPIRY_MINUTES } = require('../../../src/constants');
const { FEATURE_FLAGS } = require('../../../src/config/feature-flag.config');

const aMaker = users.find((user) => user.username === 'MAKER');

jest.mock('../../../src/v1/email');

jest.mock('node:crypto', () => ({
  ...jest.requireActual('node:crypto'),
  pbkdf2Sync: jest.fn(),
  randomBytes: jest.fn(),
}));

// TODO DTFS2-6750: make token / code / authentication / sign in language consistent
(FEATURE_FLAGS.MAGIC_LINK ? describe : describe.skip)('POST /users/me/sign-in-link', () => {
  const url = '/v1/users/me/sign-in-link';
  const hash = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const salt = 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';
  const saltBytes = Buffer.from(salt, 'hex');
  const signInCode = '0a1b2c3d4e5f67890a1b2c3d4e5f6789';
  const user = { ...aMaker, username: 'TEMPORARY_USER' };
  let testUser;
  let userId;
  let userToken;

  beforeAll(async () => {
    await wipeDB.wipe(['users']);
    testUser = await setUpApiTestUser(as);

    const { body: { user: createdUser } } = await as(testUser).post(user).to('/v1/users');
    userId = createdUser._id;

    const { body: { token } } = await as(user).post({
      username: user.username,
      password: user.password
    }).to('/v1/login');
    userToken = token;
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  withPartial2FaOnlyAuthenticationTests({
    makeRequestWithoutAuthHeader: () => post(url, {}),
    makeRequestWithAuthHeader: (authHeader) => post(url, {}, { headers: { Authorization: authHeader } }),
    get2faCompletedUserToken: () => testUser.token,
  });

  const sendSignInLink = () => as({ token: userToken }).post().to(url);

  describe('when creating the sign in code errors', () => {
    beforeEach(() => {
      when(randomBytes)
        .calledWith(32)
        .mockImplementationOnce(() => { throw new Error(); });
    });

    it('returns a 500 error response', async () => {
      const { status, body } = await sendSignInLink();
      expect500ErrorWithFailedToCreateCodeMessage({ status, body });
    });
  });

  describe('when creating the sign in code succeeds', () => {
    beforeEach(() => {
      when(randomBytes)
        .calledWith(32)
        .mockReturnValueOnce(Buffer.from(signInCode, 'hex'));
    });

    describe('when creating the sign in salt errors', () => {
      beforeEach(() => {
        when(randomBytes)
          .calledWith(64)
          .mockImplementationOnce(() => { throw new Error(); });
      });

      it('returns a 500 error response', async () => {
        const { status, body } = await sendSignInLink();
        expect500ErrorWithFailedToSaveCodeMessage({ status, body });
      });
    });

    describe('when creating the sign in salt succeeds', () => {
      beforeEach(() => {
        when(randomBytes)
          .calledWith(64)
          .mockReturnValueOnce(saltBytes);
      });

      describe('when creating the sign in hash errors', () => {
        beforeEach(() => {
          when(pbkdf2Sync)
            .calledWith(signInCode, saltBytes, 210000, 64, 'sha512')
            .mockImplementationOnce(() => { throw new Error(); });
        });

        it('returns a 500 error response', async () => {
          const { status, body } = await sendSignInLink();
          expect500ErrorWithFailedToSaveCodeMessage({ status, body });
        });
      });

      describe('when creating the sign in hash succeeds', () => {
        beforeEach(() => {
          when(pbkdf2Sync)
            .calledWith(signInCode, saltBytes, 210000, 64, 'sha512')
            .mockReturnValueOnce(Buffer.from(hash, 'hex'));
        });

        it('saves the sign in hash and salt in the database', async () => {
          await sendSignInLink();

          const userInDb = await (await db.getCollection('users')).findOne({ _id: { $eq: ObjectId(userId) } });
          const { signInCode: { hash: signInHash, salt: signInSalt } } = userInDb;
          expect(signInHash).toBe(hash);
          expect(signInSalt).toBe(salt);
        });

        it('sends a sign in link email to the user', async () => {
          await sendSignInLink();

          expect(sendEmail).toHaveBeenCalledWith('2eab0ad2-eb92-43a4-b04c-483c28a4da18', user.email, {
            firstName: user.firstname,
            lastName: user.surname,
            signInLink: `http://localhost/login/sign-in-link?t=${signInCode}`,
            signInLinkExpiryMinutes: SIGN_IN_LINK_EXPIRY_MINUTES,
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
        });
      });
    });
  });

  function expect500ErrorWithFailedToCreateCodeMessage({ status, body }) {
    expect(status).toBe(500);
    expect(body).toStrictEqual({
      error: 'Internal Server Error',
      message: 'Failed to create a sign in code.'
    });
  }

  function expect500ErrorWithFailedToSaveCodeMessage({ status, body }) {
    expect(status).toBe(500);
    expect(body).toStrictEqual({
      error: 'Internal Server Error',
      message: 'Failed to save the sign in code.'
    });
  }

  function expect500ErrorWithFailedToSendEmailMessage({ status, body }) {
    expect(status).toBe(500);
    expect(body).toStrictEqual({
      error: 'Internal Server Error',
      message: 'Failed to email the sign in code.'
    });
  }
});
