const { when } = require('jest-when');
const { produce } = require('immer');
const { cloneDeep } = require('lodash');
const { UserService } = require('./user.service');
const { SignInLinkService } = require('./sign-in-link.service');
const { TEST_USER_TRANSFORMED_FROM_DATABASE } = require('../../../test-helpers/unit-test-mocks/mock-user');
const utils = require('../../crypto/utils');
const { STATUS } = require('../../constants/user');
const UserBlockedError = require('../errors/user-blocked.error');
const UserDisabledError = require('../errors/user-disabled.error');

jest.mock('../../crypto/utils');

describe('SignInLinkService', () => {
  const token = '0a1b2c3d4e5f67890a1b2c3d4e5f6789';
  const sessionIdentifier = 'a session id';
  const tokenObjectWithoutSessionIdentifier = {
    token,
    expiresIn: Date.now(),
  };
  const tokenObject = {
    ...tokenObjectWithoutSessionIdentifier,
    sessionIdentifier,
  };

  let service;

  let randomGenerator;
  let hasher;
  let userRepository;
  const userService = new UserService();
  let testUser;

  beforeEach(() => {
    jest.resetAllMocks();
    randomGenerator = {
      randomHexString: jest.fn(),
    };
    hasher = {
      hash: jest.fn(),
      verifyHash: jest.fn(),
    };
    userRepository = {
      findById: jest.fn(),
      updateLastLoginAndResetSignInData: jest.fn(),
    };
    service = new SignInLinkService(randomGenerator, hasher, userRepository, userService);
    testUser = cloneDeep(TEST_USER_TRANSFORMED_FROM_DATABASE);
  });

  describe('loginUser', () => {
    describe('when the user is blocked', () => {
      let blockedUser;
      beforeEach(() => {
        blockedUser = produce(testUser, (draft) => {
          draft['user-status'] = STATUS.BLOCKED;
        });
        when(userRepository.findById).calledWith(blockedUser._id).mockResolvedValueOnce(blockedUser);
        when(utils.issueValid2faJWT).calledWith(blockedUser).mockReturnValueOnce(tokenObject);
        when(userRepository.updateLastLoginAndResetSignInData).calledWith({ userId: blockedUser._id, sessionIdentifier }).mockResolvedValueOnce(undefined);
      });

      it('throws a UserBlockedError if the user is blocked', async () => {
        await expect(service.loginUser(blockedUser._id)).rejects.toThrow(UserBlockedError);
      });
    });

    describe('when the user is disabled', () => {
      let disabledUser;

      beforeEach(() => {
        disabledUser = produce(testUser, (draft) => {
          draft.disabled = true;
        });
        when(userRepository.findById).calledWith(disabledUser._id).mockResolvedValueOnce(disabledUser);
        when(utils.issueValid2faJWT).calledWith(disabledUser).mockReturnValueOnce(tokenObject);
        when(userRepository.updateLastLoginAndResetSignInData).calledWith({ userId: disabledUser._id, sessionIdentifier }).mockResolvedValueOnce(undefined);
      });

      it('throws a UserDisabledError if the user is disabled', async () => {
        await expect(service.loginUser(disabledUser._id)).rejects.toThrow(UserDisabledError);
      });
    });

    describe('when the user is not blocked or disabled', () => {
      beforeEach(() => {
        mockUserTestConfig(testUser);
      });

      it('updates the last login of the user', async () => {
        await service.loginUser(testUser._id);
        expect(userRepository.updateLastLoginAndResetSignInData).toHaveBeenCalledWith({
          userId: testUser._id,
          sessionIdentifier,
        });
      });

      it('returns the user and a new 2FA JWT for the user', async () => {
        await expect(service.loginUser(testUser._id)).resolves.toStrictEqual({
          user: testUser,
          tokenObject: tokenObjectWithoutSessionIdentifier,
        });
      });
    });

    function mockUserTestConfig(user) {
      when(userRepository.findById).calledWith(user._id).mockResolvedValueOnce(user);
      when(utils.issueValid2faJWT).calledWith(user).mockReturnValueOnce(tokenObject);
      when(userRepository.updateLastLoginAndResetSignInData).calledWith({ userId: user._id, sessionIdentifier }).mockResolvedValueOnce(undefined);
    }
  });
});
