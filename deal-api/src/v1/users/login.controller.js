const utils = require('../../crypto/utils');
const { userNotFound, userIsBlocked, incorrectPassword } = require('../../constants/login-results');
const { findByUsername, updateLastLogin, incrementFailedLoginCount } = require('./controller');

module.exports = (username, password) => new Promise((resolve) => {
  findByUsername(username, async (err, user) => {
    if (err) {
      return resolve({ err });
    }

    if (user === null) {
      return resolve({ err: userNotFound });
    }

    const passwordIncorrect = !utils.validPassword(password, user.hash, user.salt);
    if (passwordIncorrect) {
      await incrementFailedLoginCount(user);
      return resolve({ err: incorrectPassword });
    }
    if (user['user-status'] === 'blocked') {
      return resolve({ err: userIsBlocked });
    }
    const tokenObject = utils.issueJWT(user);

    return updateLastLogin(user, () => resolve({ user, tokenObject }));
  });
});
