const { cloneDeep } = require('lodash');
const utils = require('../../../../crypto/utils');

/**
 * Ensures that if the change has a password property, it is not a password that has been used before
 * @param {object} user the existing user
 * @param {object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const passwordsCannotBeReUsed = (user, change) => {
  if (change && change.password) {
    const { password } = change;
    const { blockedPasswordList: existingBlockedPasswordList = [] } = user;

    // Add current password to check
    const blockedPasswordList = cloneDeep(existingBlockedPasswordList);
    blockedPasswordList.push({ oldHash: user.hash, oldSalt: user.salt });

    const passwordAlreadyUsed = blockedPasswordList.reduce((soFar, blockedPasswordEntry) => {
      const { oldSalt, oldHash } = blockedPasswordEntry;
      return soFar || utils.validPassword(password, oldHash, oldSalt);
    }, false);

    if (passwordAlreadyUsed) {
      return [
        {
          password: {
            order: '6',
            text: 'You cannot re-use old passwords.',
          },
        },
      ];
    }
  }

  return [];
};

module.exports = passwordsCannotBeReUsed;
