const { ObjectId } = require('mongodb');
const { when } = require('jest-when');
const { getUserByPasswordToken } = require('./reset-password.controller');
const { update, findByUsername } = require('./controller');
const { resetPasswordWithToken, login, sendSignInLinkEmailAndHandleErrors} = require('./routes');
const utils = require('../../crypto/utils');
const { FEATURE_FLAGS } = require('../../config/feature-flag.config');

jest.mock('./reset-password.controller');
jest.mock('./controller');
jest.mock('./login.controller', () => ({
  login: () => Promise.resolve({ tokenObject: {}, user: {} }),
}));

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

  describe('login', () => {

    // TODO DTFS2-6680: Remove this describe block and the relevant 
    // logic in the beforeEach/afterEach blocks once the feature
    // flag is removed.
    describe('if the magic link feature flag is on', () => {

      let originalMagicLinkFeatureFlag;

      beforeEach(() => {
        jest.resetAllMocks();
        originalMagicLinkFeatureFlag = FEATURE_FLAGS.MAGIC_LINK;
        FEATURE_FLAGS.MAGIC_LINK = true;
      });

      afterEach(() => {
        FEATURE_FLAGS.MAGIC_LINK = originalMagicLinkFeatureFlag;
      });

      it('calls findByUsername with the correct arguments', async () => {
        const username = 'aUsername';
        const password = 'aPassword';

        const req = {
          body: {
            username,
            password,
          },
        };

        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
      
        const next = jest.fn();

        await login(req, res, next);

        expect(findByUsername).toHaveBeenCalledWith(
          username,
          expect.any(Function)
        );
      });
    });
  });

  describe('sendSignInLinkEmailAndHandleErrors', () => {
    const next = jest.fn();

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('calls next with the error if there is an error', async () => {
      const error = new Error();
      const user = {};

      await sendSignInLinkEmailAndHandleErrors(next)(error, user);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('calls sendSignInLinkEmail with the correct arguments', async () => {
      const error = new Error();
      const user = {};

      await sendSignInLinkEmailAndHandleErrors(next)(error, user);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
