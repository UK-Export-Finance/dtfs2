const { DASHBOARD } = require('../constants');

/**
 * Updates the session after successful login with new authentication details.
 *
 * @param {Object} params.req - The Express request object containing the session.
 * @param {string} params.newUserToken - The new JWT token for the authenticated user.
 * @param {string} params.loginStatus - The login status (e.g., VALID_2FA).
 * @param {Object} params.user - The user object to store in the session.
 * @returns {{ success: boolean, session?: Object, error?: Error }} An object indicating whether the
 * session update succeeded, with the updated session on success or the error on failure.
 */
const updateSessionAfterLogin = ({ req, newUserToken, loginStatus, user }) => {
  try {
    if (!req || !req.session) {
      throw new Error('Cannot update session after login: req.session is not available.');
    }

    req.session.userToken = newUserToken;
    req.session.user = user;
    req.session.loginStatus = loginStatus;
    req.session.dashboardFilters = DASHBOARD.DEFAULT_FILTERS;
    delete req.session.numberOfSendSignInLinkAttemptsRemaining;
    delete req.session.numberOfSignInOtpAttemptsRemaining;
    delete req.session.userEmail;
    delete req.session.userId;

    return {
      success: true,
      session: req.session,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};

module.exports = updateSessionAfterLogin;
