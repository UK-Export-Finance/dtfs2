const { when } = require('jest-when');
const { produce } = require('immer');
const { cloneDeep } = require('lodash');
const { UserService } = require('./user.service');
const { TEST_USER_TRANSFORMED_FROM_DATABASE } = require('../../../test-helpers/unit-test-mocks/mock-user');
const { STATUS } = require('../../constants/user');
const UserBlockedError = require('../errors/user-blocked.error');
const UserDisabledError = require('../errors/user-disabled.error');

describe('UserService', () => {
  let userService;
  let userRepository;
  let testUser;

  beforeEach(() => {
    jest.resetAllMocks();
    userRepository = {
      findById: jest.fn(),
    };
    userService = new UserService(userRepository);
    testUser = cloneDeep(TEST_USER_TRANSFORMED_FROM_DATABASE);
  });

  describe('when the user is blocked', () => {
    let blockedUser;
    beforeEach(() => {
      blockedUser = produce(testUser, (draft) => {
        draft['user-status'] = STATUS.BLOCKED;
      });
      when(userRepository.findById).calledWith(blockedUser._id).mockResolvedValueOnce(blockedUser);
    });

    it('validating user throws a UserBlockedError', async () => {
      await expect(userService.validateUserIsActiveAndNotDisabled(blockedUser._id)).rejects.toThrow(UserBlockedError);
    });

    it('checking a user is blocked or disabled returns true', async () => {
      const result = await userService.isUserBlockedOrDisabled(blockedUser._id);
      expect(result).toBe(true);
    });
  });

  describe('when the user is disabled', () => {
    let disabledUser;
    beforeEach(() => {
      disabledUser = produce(testUser, (draft) => {
        draft.disabled = true;
      });
      when(userRepository.findById).calledWith(disabledUser._id).mockResolvedValueOnce(disabledUser);
    });

    it('validating user throws a UserDisabledError', async () => {
      await expect(userService.validateUserIsActiveAndNotDisabled(disabledUser._id)).rejects.toThrow(UserDisabledError);
    });

    it('checking a user is blocked or disabled returns true', async () => {
      const result = await userService.isUserBlockedOrDisabled(disabledUser._id);
      expect(result).toBe(true);
    });
  });

  describe('when the user is blocked and disabled', () => {
    let disabledAndBlockedUser;
    beforeEach(() => {
      disabledAndBlockedUser = produce(testUser, (draft) => {
        draft.disabled = true;
      });
      when(userRepository.findById).calledWith(disabledAndBlockedUser._id).mockResolvedValueOnce(disabledAndBlockedUser);
    });

    it('validating user throws a UserDisabledError', async () => {
      await expect(userService.validateUserIsActiveAndNotDisabled(disabledAndBlockedUser._id)).rejects.toThrow(UserDisabledError);
    });

    it('checking a user is blocked or disabled returns true', async () => {
      const result = await userService.isUserBlockedOrDisabled(disabledAndBlockedUser._id);
      expect(result).toBe(true);
    });
  });

  describe('when the user not disabled or blocked', () => {
    beforeEach(() => {
      when(userRepository.findById).calledWith(testUser._id).mockResolvedValueOnce(testUser);
    });

    it('validating user throws a UserBlockedError', async () => {
      await expect(userService.validateUserIsActiveAndNotDisabled(testUser._id)).resolves;
    });

    it('checking a user is blocked or disabled returns false', async () => {
      const result = await userService.isUserBlockedOrDisabled(testUser._id);
      expect(result).toBe(false);
    });
  });
});
