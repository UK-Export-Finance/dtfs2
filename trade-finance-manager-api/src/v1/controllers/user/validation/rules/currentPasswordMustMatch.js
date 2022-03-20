const utils = require('../../../../../utils/crypto.util');

module.exports = (user, change) => {
  const { password, currentPassword, resetPwdToken } = change;

  if (password) {
    if (typeof currentPassword === 'undefined') {
      if (resetPwdToken && resetPwdToken === user.resetPwdToken) {
        return [];
      }

      return [{
        currentPassword: {
          order: '7',
          text: 'Current password is not correct.',
        },
      }];
    }

    const validPassword = utils.validPassword(change.currentPassword, user.hash, user.salt);

    if (!validPassword) {
      return [{
        currentPassword: {
          order: '7',
          text: 'Current password is not correct.',
        },
      }];
    }
  }

  return [];
};
