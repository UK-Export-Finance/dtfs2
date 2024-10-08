const { STATUS } = require('../../constants/user');
const UserBlockedError = require('../errors/user-blocked.error');
const UserDisabledError = require('../errors/user-disabled.error');

class UserService {
  /**
   * Validates the user has an active status and is not disabled, throws an error if not
   * @param {object} user User being validated
   * @returns {void}
   */
  validateUserIsActiveAndNotDisabled(user) {
    const isUserBlocked = user['user-status'] === STATUS.BLOCKED;
    const isUserDisabled = user.disabled;

    if (isUserDisabled) {
      throw new UserDisabledError(user._id);
    }

    if (isUserBlocked) {
      throw new UserBlockedError(user._id);
    }
  }

  /**
   * Returns a boolean indicating if the user is blocked or disabled
   * @param {object} user User being validated
   * @returns {boolean}
   */
  isUserBlockedOrDisabled(user) {
    return user['user-status'] === STATUS.BLOCKED || user.disabled === true;
  }
}

module.exports = {
  UserService,
};
