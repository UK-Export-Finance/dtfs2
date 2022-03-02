const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const { as } = require('../../api')(app);

const { resetPassword, getUserByPasswordToken } = require('../../../src/v1/users/reset-password.controller');

const users = require('./test-data');

const aMaker = users.find((user) => user.username === 'MAKER_WITH_EMAIL');

jest.mock('../../../src/v1/email');
const sendEmail = require('../../../src/v1/email');

const resetPasswordEmailTemplateId = '6935e539-1a0c-4eca-a6f3-f239402c0987';
const passwordUpdateConfirmationTemplateId = '41235821-7e52-4d63-a773-fa147362c5f0';

describe('password reset', () => {
  beforeEach(async () => {
    await wipeDB.wipe(['users']);
    await as().post(aMaker).to('/v1/users');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return success=false for non-existant email', async () => {
    const reset = await resetPassword('no.user@email.com');
    expect(reset).toMatchObject({ success: false });
  });

  it('should return success=true and sendEmail for existing email', async () => {
    const reset = await resetPassword(aMaker.email);
    expect(reset).toMatchObject({ success: true });
    expect(sendEmail).toHaveBeenCalledWith(resetPasswordEmailTemplateId, aMaker.email, {
      resetToken: expect.any(String),
    });
  });

  it('should be case-insensitive when accepting email', async () => {
    const reset = await resetPassword(aMaker.email.toUpperCase());
    expect(reset).toMatchObject({ success: true });
  });

  it('should return false for a invalid reset token', async () => {
    const user = await getUserByPasswordToken('invalid-reset-token');
    expect(user).toEqual(false);
  });

  it('should return the correct user for a given reset token', async () => {
    const reset = await resetPassword(aMaker.email);
    const user = await getUserByPasswordToken(reset.resetToken);

    const { password, ...makerWithoutPassword } = aMaker;
    expect(user).toMatchObject(makerWithoutPassword);
  });

  describe('api calls', () => {
    describe('/v1/users/reset-password', () => {
      it('should not send an email that doesn\'t exist', async () => {
        const { status, body } = await as().post({ email: 'no.user@email.com' }).to('/v1/users/reset-password');
        expect(status).toEqual(200);
        expect(body).toMatchObject({ success: false });
        expect(sendEmail).not.toHaveBeenCalled();
      });

      it('should send an email with reset token', async () => {
        const { status, body } = await as().post({ email: aMaker.email }).to('/v1/users/reset-password');
        expect(status).toEqual(200);
        expect(body).toMatchObject({ success: true });
        expect(sendEmail).toHaveBeenCalledWith(resetPasswordEmailTemplateId, aMaker.email, {
          resetToken: expect.any(String),
        });
      });
    });

    describe('/v1/users/reset-password/:token', () => {
      it('should return error for empty current password field', async () => {
        const { body } = await as().post({ currentPassword: '', password: '1', passwordConfirm: '1' }).to('/v1/users/reset-password/madeuptoken123');
        expect(body.success).toEqual(false);
        expect(body.errors.errorList.currentPassword.text).toEqual('Empty password');
      });

      it('should return error for empty new password field', async () => {
        const { body } = await as().post({ currentPassword: '1', password: '', passwordConfirm: '1' }).to('/v1/users/reset-password/madeuptoken123');
        expect(body.success).toEqual(false);
        expect(body.errors.errorList.password.text).toEqual('Empty password');
      });

      it('should return error for empty new confirm password field', async () => {
        const { body } = await as().post({ currentPassword: '1', password: '1', passwordConfirm: '' }).to('/v1/users/reset-password/madeuptoken123');
        expect(body.success).toEqual(false);
        expect(body.errors.errorList.passwordConfirm.text).toEqual('Empty password');
      });

      it('should return error for new passwords do not match', async () => {
        const { body } = await as().post({ currentPassword: '123', password: '1', passwordConfirm: '2' }).to('/v1/users/reset-password/madeuptoken123');
        expect(body.success).toEqual(false);
        expect(body.errors.errorList.password.text).toEqual('Password do not match');
        expect(body.errors.errorList.passwordConfirm.text).toEqual('Password do not match');
      });

      it('should return error for invalid token', async () => {
        const { body } = await as().post({ currentPassword: 'currentPassword', password: 'newPassword', passwordConfirm: 'newPassword' }).to('/v1/users/reset-password/madeuptoken123');
        expect(body.success).toEqual(false);
        expect(body.errors.errorList.currentPassword.text).toEqual('Password reset link is not valid');
      });

      it('should reset the users password when using correct reset token', async () => {
        const newPassword = 'XyZ!2345';
        const { resetToken } = await resetPassword(aMaker.email);
        const { status, body } = await as().post({ currentPassword: aMaker.password, password: newPassword, passwordConfirm: newPassword }).to(`/v1/users/reset-password/${resetToken}`);
        expect(status).toEqual(200);
        expect(body.success).toEqual(true);
        expect(sendEmail).toHaveBeenCalledWith(passwordUpdateConfirmationTemplateId, aMaker.email, {
          timestamp: expect.any(String),
        });
        const login = await as().post({ username: aMaker.username, password: newPassword }).to('/v1/login');
        expect(login.body).toMatchObject(
          {
            success: true,
            user: { email: aMaker.email },
          },
        );
      });
    });
  });
});
