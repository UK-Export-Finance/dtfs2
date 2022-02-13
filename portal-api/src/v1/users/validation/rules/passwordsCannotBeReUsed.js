const utils = require('../../../../utils/crypto.util');

module.exports = (user, change) => {
  if (change && change.password) {
    const { password } = change;
    const { blockedPasswordList = [] } = user;

    // Add current password to check
    blockedPasswordList.push({ oldHash: user.hash, oldSalt: user.salt });

    const passwordAlreadyUsed = blockedPasswordList.reduce((soFar, blockedPasswordEntry) => {
      const { oldSalt, oldHash } = blockedPasswordEntry;
      return soFar || utils.validPassword(password, oldHash, oldSalt);
    }, false);

    if (passwordAlreadyUsed) {
      return [{
        password: {
          order: '6',
          text: 'You cannot re-use old passwords.',
        },
      }];
    }
  }

  return [];
};
