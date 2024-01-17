const { STATUS } = require('../../constants/user');
const UserBlockedError = require('../errors/user-blocked.error');
const UserDisabledError = require('../errors/user-disabled.error');

class UserService {
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

  isUserBlockedOrDisabled(user) {
    return user['user-status'] === STATUS.BLOCKED || user.disabled === true;
  }
}

module.exports = {
  UserService,
};
