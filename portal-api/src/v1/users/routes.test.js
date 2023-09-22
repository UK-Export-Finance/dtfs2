const { ObjectId } = require('mongodb');
const { when } = require('jest-when');
const { getUserByPasswordToken } = require('./reset-password.controller');
const { update } = require('./controller');
const { resetPasswordWithToken } = require('./routes');
const utils = require('../../crypto/utils');

jest.mock('./reset-password.controller');
jest.mock('./controller');

describe('users routes', () => {
  describe('resetPasswordWithToken', () => {
    const resetPwdToken = 'token';
    const oldPassword = 'Old-password1';
    const newPassword = 'New-password1';
    const { salt: currentSalt, hash: currentHash } = utils.genPassword(oldPassword);

    const req = {
      params: { resetPwdToken },
      body: {
        password: newPassword,
        passwordConfirm: newPassword,
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    const reqWithExtraFieldsInBody = {
      ...req,
      body: {
        ...req.body,
        extraField: 'extraFieldValue',
      },
    };

    const user = {
      _id: new ObjectId(),
      resetPwdTimestamp: new Date().getTime(),
      salt: currentSalt,
      hash: currentHash,
    };

    beforeEach(() => {
      jest.resetAllMocks();
      when(getUserByPasswordToken)
        .calledWith(resetPwdToken)
        .mockResolvedValueOnce(user);
    });

    it('updates the user\'s password and reset password details', async () => {
      await resetPasswordWithToken(req, res, next);

      expect(update).toHaveBeenCalledWith(
        user._id,
        {
          password: newPassword,
          passwordConfirm: newPassword,
          resetPwdToken: '',
          resetPwdTimestamp: '',
          currentPassword: '',
          loginFailureCount: 0,
          passwordUpdatedAt: expect.any(String),
        },
        expect.any(Function)
      );
    });

    it('ignores unexpected fields supplied in the request body', async () => {
      await resetPasswordWithToken(reqWithExtraFieldsInBody, res, next);

      expect(update).toHaveBeenCalledWith(
        user._id,
        {
          password: newPassword,
          passwordConfirm: newPassword,
          resetPwdToken: '',
          resetPwdTimestamp: '',
          currentPassword: '',
          loginFailureCount: 0,
          passwordUpdatedAt: expect.any(String),
        },
        expect.any(Function)
      );
    });
  });
});
