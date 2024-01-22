const { isValidUserId, isValidSignInToken } = require('../../validation/validate-ids');
const api = require('../../api');
const CONSTANTS = require('../../constants');

const updateSessionAfterLogin = ({ req, newUserToken, loginStatus, user }) => {
  req.session.userToken = newUserToken;
  req.session.user = user;
  req.session.loginStatus = loginStatus;
  req.session.dashboardFilters = CONSTANTS.DASHBOARD.DEFAULT_FILTERS;
  delete req.session.numberOfSendSignInLinkAttemptsRemaining;
  delete req.session.userEmail;
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

    return res.render('login/post-login-redirect.njk');
  } catch (e) {
    console.error(`Error validating sign in link: ${e}`);

    /**
     * These are known error codes -- user has not got correct active session
     * 401 is no active session
     * 404 is no token found
     * */
    if (e.response?.status === 401 || e.response?.status === 404) {
      return res.redirect('/login');
    }

    if (e.response?.status === 403) {
      if (
        e.response?.data?.errors?.find(
          (error) => error.cause === CONSTANTS.HTTP_ERROR_CAUSES.USER_BLOCKED || error.cause === CONSTANTS.HTTP_ERROR_CAUSES.USER_DISABLED,
        )
      ) {
        return res.status(403).render('login/temporarily-suspended.njk');
      }
      return res.redirect('/login/sign-in-link-expired');
    }

    return res.status(500).render('_partials/problem-with-service.njk');
  }
};
