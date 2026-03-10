const utils = require('../../crypto/utils');
const { userIsBlocked, userIsDisabled, usernameOrPasswordIncorrect } = require('../../constants/login-results');
const { findByUsername, incrementFailedLoginCount, updateSessionIdentifier } = require('./controller');
const UserBlockedError = require('../errors/user-blocked.error');
const UserDisabledError = require('../errors/user-disabled.error');

/**
 * Logs in a user by validating the provided username and password.
 *
 * @param {string} username - The username of the user attempting to log in.
 * @param {string} password - The password associated with the provided username.
 * @param {object} userService - An object providing user-related services, such as validation.
 * @param {import("@ukef/dtfs2-common").AuditDetails} auditDetails - user making the request
 * @returns {Promise} A promise that resolves to an object containing either a valid JWT token and user email,
 *                    or an error message if the login fails.
 */
module.exports.login = (username, password, userService, auditDetails) =>
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
        await incrementFailedLoginCount(user, auditDetails);
        return resolve({ error: usernameOrPasswordIncorrect });
      }

      try {
        userService.validateUserIsActiveAndNotDisabled(user);
      } catch (exception) {
        console.error('Error logging in %o', exception);
        if (exception instanceof UserBlockedError) {
          return resolve({ error: userIsBlocked });
        }
        if (exception instanceof UserDisabledError) {
          return resolve({ error: userIsDisabled });
        }
      }

      const { sessionIdentifier, ...tokenObject } = utils.issueValidUsernameAndPasswordJWT(user);
      return updateSessionIdentifier(user, sessionIdentifier, auditDetails, () => resolve({ tokenObject, userEmail: user.email, userId: user._id }));
    });
  });
