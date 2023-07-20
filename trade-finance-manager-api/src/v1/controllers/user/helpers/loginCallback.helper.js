const utils = require('../../../../utils/crypto.util');
const {
  userNotFound, userIsBlocked, incorrectPassword, userIsDisabled,
} = require('../../../../constants/login-results.constant');
const { findByUsername, updateLastLogin, incrementFailedLoginCount } = require('../user.controller');

const loginCallback = (username, password) =>
  new Promise((resolve) => {
    findByUsername(username, async (error, user) => {
      if (error) {
        return resolve({ error });
      }

      if (!user) {
        return resolve({ error: userNotFound });
      }

      const passwordIncorrect = !utils.validPassword(password, user.hash, user.salt);

      if (passwordIncorrect) {
        await incrementFailedLoginCount(user);
        return resolve({ error: incorrectPassword });
      }

      if (user.disabled) {
        return resolve({ error: userIsDisabled });
      }

      if (user.status === 'blocked') {
        return resolve({ error: userIsBlocked });
      }
      const { sessionIdentifier, ...tokenObject } = utils.issueJWT(user);

      return updateLastLogin(user, sessionIdentifier, () => resolve({ user, tokenObject }));
    });
  });

module.exports = {
  loginCallback,
};
