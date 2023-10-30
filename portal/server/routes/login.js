const express = require('express');
const api = require('../api');
const { requestParams, generateErrorSummary, errorHref, validationErrorHandler } = require('../helpers');
const CONSTANTS = require('../constants');
const { FEATURE_FLAGS } = require('../config/feature-flag.config');

const router = express.Router();

router.get('/login', (req, res) => {
  const { passwordreset, passwordupdated } = req.query;
  return res.render('login/index.njk', {
    passwordreset,
    passwordupdated,
    user: req.session.user,
  });
});

router.post('/login', async (req, res) => {
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

  const tokenResponse = await api.login(email, password);

  if (!FEATURE_FLAGS.MAGIC_LINK) {
    const { success, token, user } = tokenResponse;

    if (success) {
      req.session.userToken = token;
      req.session.user = user;
      req.session.dashboardFilters = CONSTANTS.DASHBOARD.DEFAULT_FILTERS;
    } else {
      loginErrors.push(emailError);
      loginErrors.push(passwordError);
    }

    if (loginErrors.length) {
      return res.render('login/index.njk', {
        errors: validationErrorHandler(loginErrors),
      });
    }

    return res.redirect('/dashboard/deals/0');
  }
  const { success, token, loginStatus } = tokenResponse;

  if (success) {
    req.session.userToken = token;
    req.session.loginStatus = loginStatus;

    await api.sendAuthenticationEmail(token);
  } else {
    loginErrors.push(emailError);
    loginErrors.push(passwordError);
  }

  if (loginErrors.length) {
    return res.render('login/index.njk', {
      errors: validationErrorHandler(loginErrors),
    });
  }

  return res.redirect('/login/check-your-email');
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Initiate reset password email request - page
router.get('/reset-password', (req, res) => {
  const { passwordreseterror } = req.query;
  return res.render('reset-password.njk', {
    passwordreseterror,
  });
});

// Initiate reset password email request
router.post('/reset-password', async (req, res) => {
  const emailError = {
    errMsg: 'Enter an email address in the correct format, for example, name@example.com',
    errRef: 'email',
  };
  const loginErrors = [];
  const { email } = req.body;

  if (!email) {
    loginErrors.push(emailError);
    return res.render('reset-password.njk', {
      errors: validationErrorHandler(loginErrors),
    });
  }

  const { success } = await api.resetPassword(email);

  if (success) {
    return res.redirect('/login?passwordreset=1');
  }

  // If all of the above fails
  return res.redirect('/reset-password?passwordreseterror=1');
});

/**
 * 1. User forgot password
 * 2. Admin account create - user set's password
 */
router.get('/reset-password/:pwdResetToken', (req, res) => {
  res.render('user/change-password.njk', { requireCurrentPassword: false });
});

/**
 * 1. User forgot password
 * 2. Admin account create - user set's password
 */
router.post('/reset-password/:pwdResetToken', async (req, res) => {
  const { pwdResetToken } = requestParams(req);
  const { data } = await api.resetPasswordFromToken(pwdResetToken, req.body);

  const formattedValidationErrors = generateErrorSummary(data.errors, errorHref);

  if (formattedValidationErrors && formattedValidationErrors.count > 0) {
    return res.render('user/change-password.njk', {
      requireCurrentPassword: false,
      validationErrors: formattedValidationErrors,
    });
  }

  return res.redirect('/login?passwordupdated=1');
});

router.get('/login/check-your-email', (req, res) => {
  res.render('login/check-your-email.njk');
});

router.get('/sign-in-link-expired', (req, res) => {
  res.render('login/sign-in-link-expired.njk');
});

// TODO DTFS2-6680 add send new email on this endpoint
router.post('/login/check-your-email', async (req, res) => res.redirect('/login/check-your-email'));

router.get('/login/validate-email-link/:loginAuthenticationToken', async (req, res) => {
  const { loginAuthenticationToken, userToken } = requestParams(req);
  const tokenResponse = await api.validateAuthenticationEmail({ token: userToken, loginAuthenticationToken });
  const { success, token: newUserToken, loginStatus, user } = tokenResponse;

  if (success) {
    req.session.userToken = newUserToken;
    req.session.user = user;
    req.session.loginStatus = loginStatus;
    req.session.dashboardFilters = CONSTANTS.DASHBOARD.DEFAULT_FILTERS;
  } else {
    console.error('Error validating sign in link');
    return res.status(500).render('_partials/problem-with-service.njk');
  }
  return res.redirect('/dashboard/deals/0');
});

module.exports = router;
