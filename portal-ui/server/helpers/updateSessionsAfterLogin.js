const { DASHBOARD } = require('../constants');

/**
 * Updates the session after a successful login or 2FA validation.
 */
const updateSessionAfterLogin = ({ req, newUserToken, loginStatus, user }) => {
  req.session.userToken = newUserToken;
  req.session.user = user;
  req.session.loginStatus = loginStatus;
  req.session.dashboardFilters = DASHBOARD.DEFAULT_FILTERS;
  delete req.session.numberOfSendSignInLinkAttemptsRemaining;
  delete req.session.userEmail;
};

module.exports = updateSessionAfterLogin;
