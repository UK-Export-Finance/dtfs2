const { STATUS } = require('../../constants/user');
const utils = require('../../crypto/utils');
const { userIsBlocked, userIsDisabled, usernameOrPasswordIncorrect } = require('../../constants/login-results');
const { findByUsername, incrementFailedLoginCount, updateSessionIdentifier } = require('./controller');

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

      if (user['user-status'] === STATUS.BLOCKED) {
        return resolve({ error: userIsBlocked });
      }

      const { sessionIdentifier, ...tokenObject } = utils.issueValidUsernameAndPasswordJWT(user);
      return updateSessionIdentifier(user, sessionIdentifier, () => resolve({ tokenObject, userEmail: user.email }));
    });
  });
