const utils = require('../../../../crypto/utils');

/**
 * Ensures that if the change has a password property, it matches the current password
 * @param {Object} user the existing user
 * @param {Object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const currentPasswordMustMatch = (user, change) => {
  const { password, currentPassword, resetPwdToken } = change;

  if (password) {
    if (typeof currentPassword === 'undefined') {
      if (resetPwdToken && resetPwdToken === user.resetPwdToken) {
        return [];
      }

      return [
        {
          currentPassword: {
            order: '7',
            text: 'Current password is not correct.',
          },
        },
      ];
    }

    const validPassword = utils.validPassword(change.currentPassword, user.hash, user.salt);

    if (!validPassword) {
      return [
        {
          currentPassword: {
            order: '7',
            text: 'Current password is not correct.',
          },
        },
      ];
    }
  }

  return [];
};

module.exports = currentPasswordMustMatch;
