const api = require('../../api');
const { getUserRoles, validationErrorHandler } = require('../../helpers');
const CONSTANTS = require('../../constants');

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

  if (!email) loginErrors.push(emailError);
  if (!password) loginErrors.push(passwordError);

  if (email && password) {
    const tokenResponse = await api.login(email, password);

    const { success, token, user } = tokenResponse;

    if (success) {
      req.session.userToken = token;
      req.session.user = user;
      req.session.dashboardFilters = CONSTANTS.DASHBOARD.DEFAULT_FILTERS;
    } else {
      loginErrors.push(emailError);
      loginErrors.push(passwordError);
    }
  }

  if (loginErrors.length) {
    return res.render('login.njk', {
      errors: validationErrorHandler(loginErrors),
    });
  }

  const { user } = req.session;
  return redirectUserAfterSuccessfulLogIn(user, res);
};

module.exports = {
  login,
};
