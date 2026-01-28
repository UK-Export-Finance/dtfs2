const { produce } = require('immer');
const { cloneDeep } = require('lodash');
const { UserService } = require('./user.service');
const { TEST_USER_TRANSFORMED_FROM_DATABASE } = require('../../../test-helpers/unit-test-mocks/mock-user');
const { STATUS } = require('../../constants/user');
const UserBlockedError = require('../errors/user-blocked.error');
const UserDisabledError = require('../errors/user-disabled.error');

describe('UserService', () => {
  let userService;
  let testUser;

  beforeEach(() => {
    jest.resetAllMocks();
    userService = new UserService();
    testUser = cloneDeep(TEST_USER_TRANSFORMED_FROM_DATABASE);
  });

  describe('when the user is blocked', () => {
    let blockedUser;
    beforeEach(() => {
      blockedUser = produce(testUser, (draft) => {
        draft['user-status'] = STATUS.BLOCKED;
      });
    });

    it('validating user throws a UserBlockedError', async () => {
      expect(() => userService.validateUserIsActiveAndNotDisabled(blockedUser)).toThrow(UserBlockedError);
    });

    it('checking a user is blocked or disabled returns true', async () => {
      const result = userService.isUserBlockedOrDisabled(blockedUser);
      expect(result).toEqual(true);
    });
  });

  describe('when the user is disabled', () => {
    let disabledUser;
    beforeEach(() => {
      disabledUser = produce(testUser, (draft) => {
        draft.disabled = true;
      });
    });

    it('validating user throws a UserDisabledError', async () => {
      expect(() => userService.validateUserIsActiveAndNotDisabled(disabledUser)).toThrow(UserDisabledError);
    });

    it('checking a user is blocked or disabled returns true', async () => {
      const result = userService.isUserBlockedOrDisabled(disabledUser);
      expect(result).toEqual(true);
    });
  });

  describe('when the user is blocked and disabled', () => {
    let disabledAndBlockedUser;
    beforeEach(() => {
      disabledAndBlockedUser = produce(testUser, (draft) => {
        draft.disabled = true;
      });
    });

    it('validating user throws a UserDisabledError', async () => {
      expect(() => userService.validateUserIsActiveAndNotDisabled(disabledAndBlockedUser)).toThrow(UserDisabledError);
    });

    it('checking a user is blocked or disabled returns true', async () => {
      const result = userService.isUserBlockedOrDisabled(disabledAndBlockedUser);
      expect(result).toEqual(true);
    });
  });

  describe('when the user is not blocked and has disabled set to undefined', () => {
    it('validating user throws a UserBlockedError', async () => {
      expect(() => userService.validateUserIsActiveAndNotDisabled(testUser)).not.toThrow();
    });

    it('checking a user is blocked or disabled returns false', async () => {
      const result = userService.isUserBlockedOrDisabled(testUser._id);
      expect(result).toEqual(false);
    });
  });

  describe('when the user is not blocked and has disabled set to false', () => {
    let disabledSetToFalseUser;
    beforeEach(() => {
      disabledSetToFalseUser = produce(testUser, (draft) => {
        draft.disabled = false;
      });
    });

    it('validating user throws a UserBlockedError', async () => {
      expect(() => userService.validateUserIsActiveAndNotDisabled(disabledSetToFalseUser)).not.toThrow();
    });

    it('checking a user is blocked or disabled returns false', async () => {
      const result = userService.isUserBlockedOrDisabled(disabledSetToFalseUser._id);
      expect(result).toEqual(false);
    });
  });
});
