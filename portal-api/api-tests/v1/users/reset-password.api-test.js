const databaseHelper = require('../../database-helper');
const { setUpApiTestUser } = require('../../api-test-users');

const app = require('../../../src/createApp');
const { as } = require('../../api')(app);

const { resetPassword, getUserByPasswordToken } = require('../../../src/v1/users/reset-password.controller');

const users = require('./test-data');

const aMaker = users.find((user) => user.username === 'MAKER_WITH_EMAIL');
const MOCK_USER = { ...aMaker, username: 'TEMPORARY_USER' };

const utils = require('../../../src/crypto/utils');

jest.mock('../../../src/v1/email');
const sendEmail = require('../../../src/v1/email');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

const { FEATURE_FLAGS } = require('../../../src/config/feature-flag.config');

jest.mock('../../../src/v1/users/login.controller', () => ({
  ...jest.requireActual('../../../src/v1/users/login.controller'),
  sendSignInLinkEmail: jest.fn(() => Promise.resolve({ status: 201 })),
}));

const RESET_PASSWORD_EMAIL_TEMPLATE_ID = '6935e539-1a0c-4eca-a6f3-f239402c0987';
const PASSWORD_UPDATE_CONFIRMATION_TEMPLATE_ID = '41235821-7e52-4d63-a773-fa147362c5f0';

function mockKnownTokenResponse(token) {
  return () => ({ hash: token });
}

describe('password reset', () => {
  let loggedInUser;

  beforeAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.USERS]);
    loggedInUser = await setUpApiTestUser(as);
  });

  beforeEach(async () => {
    databaseHelper.deleteUser(MOCK_USER);
    await as(loggedInUser).post(MOCK_USER).to('/v1/users');

    jest.clearAllMocks();
  });

  afterAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.USERS]);
    jest.restoreAllMocks();
  });

  it('should not send an email for non-existant email', async () => {
    await resetPassword('no.user@email.com');
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('should send an email for existing email', async () => {
    await resetPassword(MOCK_USER.email);
    expect(sendEmail).toHaveBeenCalledWith(RESET_PASSWORD_EMAIL_TEMPLATE_ID, MOCK_USER.email, {
      resetToken: expect.any(String),
    });
  });

  it('should be case-insensitive when accepting email', async () => {
    const upperCaseEmail = MOCK_USER.email.toUpperCase();
    await resetPassword(upperCaseEmail);
    expect(sendEmail).toHaveBeenCalledWith(RESET_PASSWORD_EMAIL_TEMPLATE_ID, upperCaseEmail, {
      resetToken: expect.any(String),
    });
  });

  it('should return false for a invalid reset token', async () => {
    const user = await getUserByPasswordToken('invalid-reset-token');
    expect(user).toEqual(false);
  });

  it('should return the correct user for a given reset token', async () => {
    const passwordResetToken = 'passwordResetToken';
    jest.spyOn(utils, 'genPasswordResetToken').mockImplementation(mockKnownTokenResponse(passwordResetToken));
    await resetPassword(MOCK_USER.email);
    const user = await getUserByPasswordToken(passwordResetToken);

    const { password, ...makerWithoutPassword } = MOCK_USER;
    expect(user).toMatchObject(makerWithoutPassword);
  });

  describe('api calls', () => {
    describe('/v1/users/reset-password', () => {
      it("should not send to an email that doesn't exist", async () => {
        const { status, body } = await as().post({ email: 'no.user@email.com' }).to('/v1/users/reset-password');
        expect(status).toEqual(200);
        expect(body).toMatchObject({});
        expect(sendEmail).not.toHaveBeenCalled();
      });

      it('should send an email with reset token', async () => {
        const { status, body } = await as().post({ email: MOCK_USER.email }).to('/v1/users/reset-password');
        expect(status).toEqual(200);
        expect(body).toMatchObject({});
        expect(sendEmail).toHaveBeenCalledWith(RESET_PASSWORD_EMAIL_TEMPLATE_ID, MOCK_USER.email, {
          resetToken: expect.any(String),
        });
      });
    });

    describe('/v1/users/reset-password/:token', () => {
      it('should return error for empty current password field', async () => {
        const { body } = await as().post({ currentPassword: '', password: '1', passwordConfirm: '1' }).to('/v1/users/reset-password/mock123');
        expect(body.success).toEqual(false);
        expect(body.errors.errorList.currentPassword.text).toEqual('Empty password');
      });

      it('should return error for empty new password field', async () => {
        const { body } = await as().post({ currentPassword: '1', password: '', passwordConfirm: '1' }).to('/v1/users/reset-password/mock123');
        expect(body.success).toEqual(false);
        expect(body.errors.errorList.password.text).toEqual('Empty password');
      });

      it('should return error for empty new confirm password field', async () => {
        const { body } = await as().post({ currentPassword: '1', password: '1', passwordConfirm: '' }).to('/v1/users/reset-password/mock123');
        expect(body.success).toEqual(false);
        expect(body.errors.errorList.passwordConfirm.text).toEqual('Empty password');
      });

      it('should return error for new passwords do not match', async () => {
        const { body } = await as().post({ currentPassword: '123', password: '1', passwordConfirm: '2' }).to('/v1/users/reset-password/mock123');
        expect(body.success).toEqual(false);
        expect(body.errors.errorList.password.text).toEqual('Password do not match');
        expect(body.errors.errorList.passwordConfirm.text).toEqual('Password do not match');
      });

      it('should return error for invalid token', async () => {
        const { body } = await as()
          .post({ currentPassword: 'currentPassword', password: 'newPassword', passwordConfirm: 'newPassword' })
          .to('/v1/users/reset-password/madeUpToken123');
        expect(body.success).toEqual(false);
        expect(body.errors.errorList.password.text).toEqual('Password reset link is not valid');
      });

      it('should reset the users password when using correct reset token', async () => {
        const newPassword = 'XyZ!2345';
        const passwordResetToken = 'passwordResetToken';
        jest.spyOn(utils, 'genPasswordResetToken').mockImplementation(mockKnownTokenResponse(passwordResetToken));
        await resetPassword(MOCK_USER.email);

        const { status, body } = await as()
          .post({ currentPassword: MOCK_USER.password, password: newPassword, passwordConfirm: newPassword })
          .to(`/v1/users/reset-password/${passwordResetToken}`);

        expect(status).toEqual(200);
        expect(body.success).toEqual(true);
        expect(sendEmail).toHaveBeenCalledWith(PASSWORD_UPDATE_CONFIRMATION_TEMPLATE_ID, MOCK_USER.email, {
          timestamp: expect.any(String),
        });
        const login = await as().post({ username: MOCK_USER.username, password: newPassword }).to('/v1/login');

        // TODO DTFS2-6680: remove this feature flag check
        if (!FEATURE_FLAGS.MAGIC_LINK) {
          expect(login.body).toMatchObject({
            success: true,
            user: { email: MOCK_USER.email },
          });
        } else {
          expect(login.body).toMatchObject({
            success: true,
          });
        }
      });
    });
  });
});
