const api = require('../../api');
const { getUserRoles, validationErrorHandler } = require('../../helpers');
const CONSTANTS = require('../../constants');
const { FEATURE_FLAGS } = require('../../config/feature-flag.config');

const redirectUserAfterSuccessfulLogIn = (user, res) => {
  const { isMaker, isChecker, isAdmin, isPaymentReportOfficer } = getUserRoles(user.roles);

  if (isMaker || isChecker || isAdmin) {
    return res.redirect('/dashboard/deals/0');
  }
  if (isPaymentReportOfficer) {
    return res.redirect('/utilisation-report-upload');
  }
  return res.redirect('/dashboard/deals/0');
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const loginErrors = [];

  const emailError = {
    errMsg: 'Enter an email address in the correct format, for example, name@example.com',
    errRef: 'email',
  };
  const passwordError = {
    errMsg: 'Enter a valid password',
    errRef: 'password',
  };

  if (!email || !password) {
    if (!email) loginErrors.push(emailError);
    if (!password) loginErrors.push(passwordError);

    return res.render('login/index.njk', {
      errors: validationErrorHandler(loginErrors),
    });
  }

  if (!FEATURE_FLAGS.MAGIC_LINK) {
    const tokenResponse = await api.login(email, password);

    if (!tokenResponse.success) {
      loginErrors.push(emailError);
      loginErrors.push(passwordError);

      return res.render('login/index.njk', {
        errors: validationErrorHandler(loginErrors),
      });
    }

    const { token, user } = tokenResponse;
    req.session.userToken = token;
    req.session.user = user;
    req.session.dashboardFilters = CONSTANTS.DASHBOARD.DEFAULT_FILTERS;

    return redirectUserAfterSuccessfulLogIn(user, res);
  }

  try {
    const tokenResponse = await api.login(email, password);

    const { token, loginStatus, user: { email: userEmail } } = tokenResponse;
    req.session.userToken = token;
    req.session.loginStatus = loginStatus;
    req.session.numberOfSendSignInLinkAttemptsRemaining = 2;
    // We do not store this in the user object to avoid existing logic using the existence of a `user` object to draw elements
    req.session.userEmail = userEmail;

    try {
      await api.sendSignInLink(token);
    } catch (sendSignInLinkError) {
      console.warn(
        'Failed to send sign in link. The login flow will continue as the user can retry on the next page. The error was: %O',
        sendSignInLinkError,
      );
    }

    return res.redirect('/login/check-your-email');
  } catch (loginError) {
    console.warn('Failed to login: %O', loginError);

    loginErrors.push(emailError);
    loginErrors.push(passwordError);

    return res.render('login/index.njk', {
      errors: validationErrorHandler(loginErrors),
    });
  }
};

module.exports = {
  login,
  redirectUserAfterSuccessfulLogIn,
};
