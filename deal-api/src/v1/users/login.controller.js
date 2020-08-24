const utils = require('../../crypto/utils');
const { userNotFound, userIsBlocked, incorrectPassword } = require('../../constants/login-results');
const { findByUsername, updateLastLogin, incrementFailedLoginCount } = require('./controller');

module.exports = (username, password) => new Promise((resolve) => {
  console.log(`Login attempt for ${username}`);
  findByUsername(username, async (err, user) => {
    if (err) {
      console.log(`Error finding username: ${err}`);
      return resolve({ err });
    }

    if (user === null) {
      console.log(`No user returned`);
      return resolve({ err: userNotFound });
    }

    const passwordIncorrect = !utils.validPassword(password, user.hash, user.salt);
    if (passwordIncorrect) {
      console.log(`Incorrect password`);
      await incrementFailedLoginCount(user);
      return resolve({ err: incorrectPassword });
    }
    if (user['user-status'] === 'blocked') {
      console.log(`User is blocked`);
      return resolve({ err: userIsBlocked });
    }
    const tokenObject = utils.issueJWT(user);

    return updateLastLogin(user, () => resolve({ user, tokenObject }));
  });
});
