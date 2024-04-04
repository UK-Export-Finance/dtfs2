const { isValidUserId, isValidSignInToken } = require('../../validation/validate-ids');
const api = require('../../api');
const { DASHBOARD, LANDING_PAGES, HTTP_ERROR_CAUSES } = require('../../constants');
const { getUserRoles } = require('../../helpers');

const updateSessionAfterLogin = ({ req, newUserToken, loginStatus, user }) => {
  req.session.userToken = newUserToken;
  req.session.user = user;
  req.session.loginStatus = loginStatus;
  req.session.dashboardFilters = DASHBOARD.DEFAULT_FILTERS;
  delete req.session.numberOfSendSignInLinkAttemptsRemaining;
  delete req.session.userEmail;
};

/**
 * Gets the redirect url for the user after they have successfully logged in
 * @param {object} user - The user object
 * @returns {import('../../types/landing-pages').LandingPage}
 */
const getUserRedirectUrl = (user) => {
  const { isMaker, isChecker, isAdmin, isPaymentReportOfficer } = getUserRoles(user.roles);

  if (isMaker || isChecker || isAdmin) {
    return LANDING_PAGES.DEFAULT;
  }
  if (isPaymentReportOfficer) {
    return LANDING_PAGES.UTILISATION_REPORT_UPLOAD;
  }
  return LANDING_PAGES.DEFAULT;
};

module.exports.loginWithSignInLink = async (req, res) => {
  try {
    const {
      session: { userToken },
      query: { t: signInToken, u: userId },
    } = req;

    if (!isValidUserId(userId)) {
      console.error('Error validating sign in link: invalid userId %s', userId);
      return res.status(400).render('_partials/problem-with-service.njk');
    }

    if (!isValidSignInToken(signInToken)) {
      console.error('Error validating sign in token: invalid signInToken %s', signInToken);
      return res.status(400).render('_partials/problem-with-service.njk');
    }

    const loginResponse = await api.loginWithSignInLink({ token: userToken, userId, signInToken });
    const { token: newUserToken, loginStatus, user } = loginResponse;

    updateSessionAfterLogin({
      req,
      newUserToken,
      loginStatus,
      user,
    });

    const redirectUrl = getUserRedirectUrl(user);
    return res.render('login/post-login-redirect.njk', {
      redirectUrl,
    });
  } catch (error) {
    console.error('Error validating sign in link %o', error);

    /**
     * These are known error codes -- user has not got correct active session
     * 401 is no active session
     * 404 is no token found
     * */
    if (error.response?.status === 401 || error.response?.status === 404) {
      return res.redirect('/login');
    }

    if (error.response?.status === 403) {
      if (
        error.response?.data?.errors?.find(
          (exception) => exception.cause === HTTP_ERROR_CAUSES.USER_BLOCKED || exception.cause === HTTP_ERROR_CAUSES.USER_DISABLED,
        )
      ) {
        return res.status(403).render('login/temporarily-suspended.njk');
      }
      return res.redirect('/login/sign-in-link-expired');
    }

    return res.status(500).render('_partials/problem-with-service.njk');
  }
};
