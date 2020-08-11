const utils = require('../../../../crypto/utils');

module.exports = (user, change) => {
  if (change && change.password) {
    const { password } = change;
    const { blockedPasswordList } = user;

    const passwordAlreadyUsed = blockedPasswordList
      && blockedPasswordList.reduce((soFar = false, blockedPasswordEntry) => {
        const { salt, hash } = blockedPasswordEntry;
        return soFar || utils.validPassword(password, salt, hash);
      });

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
