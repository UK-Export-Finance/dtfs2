const utils = require('../../crypto/utils');
const {
  userNotFound, userIsBlocked, incorrectPassword, userIsDisabled,
} = require('../../constants/login-results');
const { findByUsername, updateLastLogin, incrementFailedLoginCount } = require('./controller');

module.exports = (username, password) => new Promise((resolve) => {
  findByUsername(username, async (error, user) => {
    if (error) {
      return resolve({ error });
    }

    if (user === null) {
      return resolve({ error: userNotFound });
    }

    const passwordIncorrect = !utils.validPassword(password, user.hash, user.salt);

    if (user.disabled) {
      return resolve({ error: userIsDisabled });
    }

    if (passwordIncorrect) {
      await incrementFailedLoginCount(user);
      return resolve({ error: incorrectPassword });
    }
    if (user['user-status'] === 'blocked') {
      return resolve({ error: userIsBlocked });
    }
    const { sessionIdentifier, ...tokenObject } = utils.issueJWT(user);

    return updateLastLogin(user, sessionIdentifier, () => resolve({ user, tokenObject }));
  });
});
