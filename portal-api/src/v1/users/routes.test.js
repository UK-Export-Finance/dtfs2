const mockSignInLinkControllerLoginWithSignInLink = jest.fn();
jest.mock('./sign-in-link.controller', () => ({
  SignInLinkController: jest.fn().mockImplementation(() => ({ loginWithSignInLink: mockSignInLinkControllerLoginWithSignInLink })),
}));
const mockUserControllerUpdateUser = jest.fn((_id, user, auditDetails, callback) => {
  const mockUser = { ...user, _id };
  callback(null, mockUser);
});
const mockUserControllerFindOne = jest.fn((_id, callback) => {
  const mockUser = { _id };
  callback(null, mockUser);
});
jest.mock('./controller', () => ({ update: mockUserControllerUpdateUser, findOne: mockUserControllerFindOne }));
const mockValidationApplyUpdateRules = jest.fn(() => []);
jest.mock('./validation', () => ({
  applyUpdateRules: mockValidationApplyUpdateRules,
  applyCreateRules: mockValidationApplyUpdateRules,
}));

const { ObjectId } = require('mongodb');
const { when } = require('jest-when');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { generateMockPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { getUserByPasswordToken } = require('./reset-password.controller');
const { resetPasswordWithToken, loginWithSignInLink, updateById } = require('./routes');
const utils = require('../../crypto/utils');
const { ADMIN } = require('../roles/roles');
const { USER } = require('../../constants');

jest.mock('./reset-password.controller');
jest.mock('./login.controller', () => ({
  login: () => Promise.resolve({ tokenObject: {}, user: {} }),
  sendSignInLinkEmail: jest.fn(),
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
      jest.clearAllMocks();
      when(getUserByPasswordToken).calledWith(resetPwdToken).mockResolvedValueOnce(user);
    });

    it("updates the user's password and reset password details", async () => {
      await resetPasswordWithToken(req, res, next);

      expect(mockUserControllerUpdateUser).toHaveBeenCalledWith(
        user._id,
        {
          password: newPassword,
          passwordConfirm: newPassword,
          resetPwdToken: '',
          resetPwdTimestamp: '',
          currentPassword: '',
          loginFailureCount: 0,
          passwordUpdatedAt: expect.any(String),
          auditRecord: generateMockPortalUserAuditDatabaseRecord(user._id),
        },
        generatePortalAuditDetails(user._id),
        expect.any(Function),
      );
    });

    it('ignores unexpected fields supplied in the request body', async () => {
      await resetPasswordWithToken(reqWithExtraFieldsInBody, res, next);

      expect(mockUserControllerUpdateUser).toHaveBeenCalledWith(
        user._id,
        {
          password: newPassword,
          passwordConfirm: newPassword,
          resetPwdToken: '',
          resetPwdTimestamp: '',
          currentPassword: '',
          loginFailureCount: 0,
          passwordUpdatedAt: expect.any(String),
          auditRecord: generateMockPortalUserAuditDatabaseRecord(user._id),
        },
        generatePortalAuditDetails(user._id),
        expect.any(Function),
      );
    });
  });

  describe('loginWithSignInLink', () => {
    const req = {};
    const res = {};

    it('calls the loginWithSignInLink method on the signInLinkController and returns the result', async () => {
      when(mockSignInLinkControllerLoginWithSignInLink).calledWith(req, res).mockResolvedValue('mock result');

      const result = await loginWithSignInLink(req, res);

      expect(result).toEqual('mock result');
    });
  });

  describe('updateById', () => {
    const res = {
      send: jest.fn(),
      status: jest.fn(),
      json: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      res.status.mockReturnThis();
    });

    it('allows user to change their own password', async () => {
      const req = {
        params: {
          _id: '1234',
        },
        user: {
          _id: '1234',
          roles: [],
        },
        body: {
          password: 'AbC!234',
          passwordConfirm: 'AbC!234',
        },
      };

      await updateById(req, res);

      expect(mockUserControllerFindOne).toHaveBeenCalledWith(req.params._id, expect.any(Function));
      expect(mockUserControllerUpdateUser).toHaveBeenCalledWith(req.params._id, req.body, generatePortalAuditDetails(req.user._id), expect.any(Function));
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('does not allow a user to change their status', async () => {
      const req = {
        params: {
          _id: '1234',
        },
        user: {
          _id: '1234',
          roles: [],
        },
        body: {
          'user-status': USER.STATUS.ACTIVE,
        },
      };

      await updateById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('allows admin to change another users status and password', async () => {
      const req = {
        params: {
          _id: '1234',
        },
        user: {
          _id: 'NOT1234',
          roles: [ADMIN],
        },
        body: {
          password: 'AbC!234',
          passwordConfirm: 'AbC!234',
          'user-status': USER.STATUS.ACTIVE,
        },
      };

      await updateById(req, res);

      expect(mockUserControllerFindOne).toHaveBeenCalledWith(req.params._id, expect.any(Function));
      expect(mockUserControllerUpdateUser).toHaveBeenCalledWith(req.params._id, req.body, generatePortalAuditDetails(req.user._id), expect.any(Function));
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('does not allow a non-admin user to change someone elses password', async () => {
      const req = {
        params: {
          _id: '1234',
        },
        user: {
          _id: 'NOT1234',
          roles: [],
        },
        body: {
          password: 'AbC!234',
          passwordConfirm: 'AbC!234',
        },
      };
      await updateById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
