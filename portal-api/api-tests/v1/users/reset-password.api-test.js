const { generateNoUserLoggedInAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const databaseHelper = require('../../database-helper');
const { setUpApiTestUser } = require('../../api-test-users');

const app = require('../../../src/createApp');
const { as } = require('../../api')(app);

const { resetPassword, getUserByPasswordToken } = require('../../../src/v1/users/reset-password.controller');

const users = require('./test-data');

const temporaryUsernameAndEmail = 'temporary_user@ukexportfinance.gov.uk';
const MOCK_USER = {
  ...users.barclaysBankMaker1,
  username: temporaryUsernameAndEmail,
  email: temporaryUsernameAndEmail,
};

const utils = require('../../../src/crypto/utils');

jest.mock('../../../src/v1/email');
const sendEmail = require('../../../src/v1/email');
const { UserService } = require('../../../src/v1/users/user.service');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const { withValidatePasswordWhenUpdateUserWithoutCurrentPasswordTests } = require('./with-validate-password.api-tests');

jest.mock('../../../src/v1/users/login.controller', () => ({
  ...jest.requireActual('../../../src/v1/users/login.controller'),
  sendSignInLinkEmail: jest.fn(() => Promise.resolve({ status: 201 })),
}));

const RESET_PASSWORD_EMAIL_TEMPLATE_ID = '6935e539-1a0c-4eca-a6f3-f239402c0987';
const PASSWORD_UPDATE_CONFIRMATION_TEMPLATE_ID = '41235821-7e52-4d63-a773-fa147362c5f0';
const EMAIL_FOR_NO_USER = 'no.user@email.com';

function mockKnownTokenResponse(token) {
  return () => ({ hash: token });
}

describe('password reset', () => {
  let loggedInUser;
  let testUser;
  const userService = new UserService();

  beforeAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.USERS]);
    loggedInUser = await setUpApiTestUser(as);
  });

  beforeEach(async () => {
    databaseHelper.deleteUser(MOCK_USER);
    const testUserResponse = await as(loggedInUser).post(MOCK_USER).to('/v1/users');
    testUser = testUserResponse.body.user;
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.USERS]);
    jest.restoreAllMocks();
  });

  it('should not send an email for non-existant email', async () => {
    await resetPassword(EMAIL_FOR_NO_USER, userService, generateNoUserLoggedInAuditDetails());
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('should send an email for existing email', async () => {
    await resetPassword(MOCK_USER.email, userService, generateNoUserLoggedInAuditDetails());
    expect(sendEmail).toHaveBeenCalledWith(RESET_PASSWORD_EMAIL_TEMPLATE_ID, MOCK_USER.email, {
      resetToken: expect.any(String),
    });
  });

  it('should be case-insensitive when accepting email', async () => {
    const upperCaseEmail = MOCK_USER.email.toUpperCase();
    await resetPassword(upperCaseEmail, userService, generateNoUserLoggedInAuditDetails());
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
    await resetPassword(MOCK_USER.email, userService, generateNoUserLoggedInAuditDetails());
    const user = await getUserByPasswordToken(passwordResetToken);

    const { password: _password, ...makerWithoutPassword } = MOCK_USER;
    expect(user).toMatchObject(makerWithoutPassword);
  });

  it('should not return a token if the token is invalid', async () => {
    // We set this field as part of createUser -- and this test checks it is not set by resetPassword
    await databaseHelper.unsetUserProperties({
      username: MOCK_USER.username,
      properties: ['resetPwdToken', 'resetPwdTimestamp'],
    });
    await databaseHelper.setUserProperties({ username: MOCK_USER.username, update: { disabled: true } });

    await resetPassword(MOCK_USER.email, userService, generateNoUserLoggedInAuditDetails());

    const fetchedUser = await databaseHelper.getUserById(testUser._id);

    expect(sendEmail).not.toHaveBeenCalled();
    expect(fetchedUser.resetPwdToken).toEqual(undefined);
    expect(fetchedUser.resetPwdTimestamp).toEqual(undefined);
  });

  describe('api calls', () => {
    describe('/v1/users/reset-password', () => {
      it("should not send to an email that doesn't exist", async () => {
        const { status, body } = await as().post({ email: EMAIL_FOR_NO_USER }).to('/v1/users/reset-password');
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
      describe('when the password reset token is not valid', () => {
        it('should return error for invalid token', async () => {
          const { body } = await as()
            .post({ currentPassword: 'currentPassword', password: 'newPassword', passwordConfirm: 'newPassword' })
            .to('/v1/users/reset-password/madeUpToken123');
          expect(body.success).toEqual(false);
          expect(body.errors.errorList.password.text).toEqual('Password reset link is not valid');
        });
      });

      describe('when the password reset token is valid', () => {
        const passwordResetToken = 'passwordResetToken';
        const validTokenUrl = `/v1/users/reset-password/${passwordResetToken}`;
        beforeEach(async () => {
          jest.spyOn(utils, 'genPasswordResetToken').mockImplementation(mockKnownTokenResponse(passwordResetToken));
        });

        withValidatePasswordWhenUpdateUserWithoutCurrentPasswordTests({
          payload: {},
          existingUserPassword: MOCK_USER.password,
          makeRequest: (payload) => as().post(payload).to(validTokenUrl),
        });

        it('should reset the users password when using correct reset token', async () => {
          const newPassword = 'XyZ!2345';
          await resetPassword(MOCK_USER.email, userService, generateNoUserLoggedInAuditDetails());

          const { status, body } = await as()
            .post({ currentPassword: MOCK_USER.password, password: newPassword, passwordConfirm: newPassword })
            .to(validTokenUrl);

          expect(status).toEqual(200);
          expect(body.success).toEqual(true);
          expect(sendEmail).toHaveBeenCalledWith(PASSWORD_UPDATE_CONFIRMATION_TEMPLATE_ID, MOCK_USER.email, {
            timestamp: expect.any(String),
          });
          const login = await as().post({ username: MOCK_USER.username, password: newPassword }).to('/v1/login');

          expect(login.body).toMatchObject({
            success: true,
          });
        });
      });
    });
  });
});
