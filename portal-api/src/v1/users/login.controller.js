const utils = require('../../crypto/utils');
const { userIsBlocked, userIsDisabled, usernameOrPasswordIncorrect } = require('../../constants/login-results');
const { findByUsername, updateLastLogin, incrementFailedLoginCount, updateSessionIdentifier } = require('./controller');
const { FEATURE_FLAGS } = require('../../config/feature-flag.config');

module.exports.login = (username, password) =>
  new Promise((resolve) => {
    findByUsername(username, async (error, user) => {
      if (error) {
        return resolve({ error });
      }

      if (user === null) {
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

      if (user['user-status'] === 'blocked') {
        return resolve({ error: userIsBlocked });
      }

      let sessionIdentifier;
      let tokenObject;
      if (!FEATURE_FLAGS.MAGIC_LINK) {
        ({ sessionIdentifier, ...tokenObject } = utils.issueJWT(user));
        return updateLastLogin(user, sessionIdentifier, () => resolve({ user, tokenObject }));
      }
      ({ sessionIdentifier, ...tokenObject } = utils.issueValidUsernameAndPasswordJWT(user));
      return updateSessionIdentifier(user, sessionIdentifier, () => resolve({ tokenObject, userEmail: user.email }));
    });
  });
