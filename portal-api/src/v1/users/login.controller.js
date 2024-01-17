const utils = require('../../crypto/utils');
const { userIsBlocked, userIsDisabled, usernameOrPasswordIncorrect } = require('../../constants/login-results');
const { findByUsername, incrementFailedLoginCount, updateSessionIdentifier } = require('./controller');
const UserBlockedError = require('../errors/user-blocked.error');
const UserDisabledError = require('../errors/user-disabled.error');

module.exports.login = (username, password, userService) =>
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

      try {
        userService.validateUserIsActiveAndNotDisabled(user);
      } catch (e) {
        console.error(e);
        if (e instanceof UserBlockedError) {
          return resolve({ error: userIsBlocked });
        }
        if (e instanceof UserDisabledError) {
          return resolve({ error: userIsDisabled });
        }
      }

      const { sessionIdentifier, ...tokenObject } = utils.issueValidUsernameAndPasswordJWT(user);
      return updateSessionIdentifier(user, sessionIdentifier, () => resolve({ tokenObject, userEmail: user.email }));
    });
  });
