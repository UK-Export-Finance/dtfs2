const utils = require('../../../../utils/crypto.util');
const {
  userNotFound, userIsBlocked, incorrectPassword, userIsDisabled,
} = require('../../../../constants/login-results.constant');
const { findByUsername, updateLastLogin, incrementFailedLoginCount } = require('../user.controller');

const loginCallback = (username, password) =>
  new Promise((resolve) => {
    findByUsername(username, async (err, user) => {
      if (err) {
        return resolve({ err });
      }

      if (!user) {
        return resolve({ err: userNotFound });
      }

      const passwordIncorrect = !utils.validPassword(password, user.hash, user.salt);

      if (passwordIncorrect) {
        await incrementFailedLoginCount(user);
        return resolve({ err: incorrectPassword });
      }

      if (user.disabled) {
        return resolve({ err: userIsDisabled });
      }

      if (user.status === 'blocked') {
        return resolve({ err: userIsBlocked });
      }
      const { sessionIdentifier, ...tokenObject } = utils.issueJWT(user);

      return updateLastLogin(user, sessionIdentifier, () => resolve({ user, tokenObject }));
    });
  });

module.exports = {
  loginCallback,
};
