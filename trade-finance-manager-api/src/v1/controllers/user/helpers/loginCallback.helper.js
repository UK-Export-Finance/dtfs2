const utils = require('../../../../utils/crypto.util');
const { userIsBlocked, userIsDisabled, usernameOrPasswordIncorrect } = require('../../../../constants/login-results.constant');
const { findByUsername, updateLastLoginAndResetSignInData, incrementFailedLoginCount } = require('../user.controller');

const loginCallback = (username, password) =>
  new Promise((resolve) => {
    findByUsername(username, async (error, user) => {
      if (error) {
        return resolve({ error });
      }

      if (!user) {
        return resolve({ error: usernameOrPasswordIncorrect });
      }

      const passwordIncorrect = !utils.validPassword(password, user.hash, user.salt);

      if (passwordIncorrect) {
        await incrementFailedLoginCount(user);
        return resolve({ error: usernameOrPasswordIncorrect });
      }

      if (user.disabled) {
        return resolve({ error: userIsDisabled });
      }

      if (user.status === 'blocked') {
        return resolve({ error: userIsBlocked });
      }

      const { sessionIdentifier, ...tokenObject } = utils.issueJWT(user);

      return updateLastLoginAndResetSignInData(user, sessionIdentifier, () => resolve({ user, tokenObject }));
    });
  });

module.exports = {
  loginCallback,
};
