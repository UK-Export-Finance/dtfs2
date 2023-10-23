const utils = require('../../crypto/utils');
const { userIsBlocked, userIsDisabled, usernameOrPasswordIncorrect } = require('../../constants/login-results');
const { findByUsername, updateLastLogin, incrementFailedLoginCount } = require('./controller');
const sendEmail = require('../email');
const CONSTANTS = require('../../constants');

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

      const { sessionIdentifier, ...tokenObject } = utils.issueJWT(user);

      return updateLastLogin(user, sessionIdentifier, () => resolve({ user, tokenObject }));
    });
  });

module.exports.sendSignInLinkEmail = async (emailAddress, firstName, signInLink) => sendEmail(
  CONSTANTS.EMAIL_TEMPLATE_IDS.SIGN_IN_LINK,
  emailAddress,
  {
    firstName,
    signInLink,
  },
);
