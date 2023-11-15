const { ObjectId } = require('mongodb');
const { when } = require('jest-when');
const { getUserByPasswordToken } = require('./reset-password.controller');
const { update } = require('./controller');
const { resetPasswordWithToken, validateSignInLink } = require('./routes');
const utils = require('../../crypto/utils');

jest.mock('./reset-password.controller');
jest.mock('./controller');
jest.mock('./login.controller', () => ({
  login: () => Promise.resolve({ tokenObject: {}, user: {} }),
  sendSignInLinkEmail: jest.fn(),
}));
jest.mock('./authentication-email.controller', () => ({
  validateSignInLinkToken: jest.fn(),
}));
jest.mock('./sanitizeUserData', () => ({
  sanitizeUser: (user) => user,
}));

const { validateSignInLinkToken } = require('./authentication-email.controller');
const { MAKER } = require('../roles/roles');
const { LOGIN_STATUSES } = require('../../constants');
const SignInLinkExpiredError = require('../errors/sign-in-link-expired.error');

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

  describe('validateSignInLink', () => {
    const signInToken = 'signInToken';
    const user = {
      _id: new ObjectId(),
      username: 'HSBC-maker-1',
      firstname: 'Mister',
      surname: 'One',
      email: 'one@email.com',
      timezone: 'Europe/London',
      roles: [MAKER],
      bank: {
        id: '961',
        name: 'HSBC',
        emails: ['maker1@ukexportfinance.gov.uk', 'maker2@ukexportfinance.gov.uk'],
      },
    };

    const req = {
      params: { signInToken },
      user
    };

    const sessionToken = 'sessionToken';
    const expires = '12h';

    const validateSignInLinkTokenResponse = {
      tokenObject: {
        token: sessionToken,
        expires,
      },
      user
    }

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('returns a 200 response with the correct response body if the sign in link token is valid', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(() => 'mockResponse'),
      };
      
      when(validateSignInLinkToken).calledWith(user, signInToken).mockResolvedValue(validateSignInLinkTokenResponse)

      const mockResponse = await validateSignInLink(req, res);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: sessionToken,
        user: user,
        loginStatus: LOGIN_STATUSES.VALID_2FA,
        expiresIn: expires,
      });
      expect(mockResponse).toBe('mockResponse');
    });

    it('returns a 410 response with the correct response body if validating the sign in link token throws a SignInLinkExpiredError', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(() => 'mockResponse'),
      };
      
      when(validateSignInLinkToken).calledWith(user, signInToken).mockRejectedValue(new SignInLinkExpiredError());

      const mockResponse = await validateSignInLink(req, res);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(410);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
      });
      expect(mockResponse).toBe('mockResponse');
    });

    it('returns a 410 response with the correct response body if validating the sign in link token throws an error other than a SignInLinkExpiredError', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(() => 'mockResponse'),
      };
      
      when(validateSignInLinkToken).calledWith(user, signInToken).mockRejectedValue(new Error());

      const mockResponse = await validateSignInLink(req, res);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
      });
      expect(mockResponse).toBe('mockResponse');
    });
  });
});
