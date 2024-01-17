const utils = require('../../crypto/utils');
const { usernameOrPasswordIncorrect } = require('../../constants/login-results');
const { findByUsername, incrementFailedLoginCount, updateSessionIdentifier } = require('./controller');

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

      userService.validateUserIsActiveAndNotDisabled(user);

      const { sessionIdentifier, ...tokenObject } = utils.issueValidUsernameAndPasswordJWT(user);
      return updateSessionIdentifier(user, sessionIdentifier, () => resolve({ tokenObject, userEmail: user.email }));
    });
  });
