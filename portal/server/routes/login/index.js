const express = require('express');
const api = require('../../api');
const { requestParams, generateErrorSummary, errorHref, validationErrorHandler } = require('../../helpers');
const { renderCheckYourEmailPage, sendNewSignInLink } = require('../../controllers/login/check-your-email');
const { loginWithSignInLink } = require('../../controllers/login/login-with-sign-in-link');
const { validatePartialAuthToken } = require('../middleware/validatePartialAuthToken');
const { LANDING_PAGES } = require('../../constants');

const router = express.Router();

router.get(LANDING_PAGES.LOGIN, (req, res) => {
  const { passwordreset, passwordupdated } = req.query;
  return res.render('login/index.njk', {
    passwordreset,
    passwordupdated,
    user: req.session.user,
  });
});

router.post(LANDING_PAGES.LOGIN, async (req, res) => {
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

  try {
    const loginResponse = await api.login(email, password);

    const {
      token,
      loginStatus,
      user: { email: userEmail },
    } = loginResponse;
    req.session.userToken = token;
    req.session.loginStatus = loginStatus;
    // We do not store this in the user object to avoid existing logic using the existence of a `user` object to draw elements
    req.session.userEmail = userEmail;
    try {
      const {
        data: { numberOfSendSignInLinkAttemptsRemaining },
      } = await api.sendSignInLink(req.session.userToken);
      req.session.numberOfSendSignInLinkAttemptsRemaining = numberOfSendSignInLinkAttemptsRemaining;
    } catch (sendSignInLinkError) {
      if (sendSignInLinkError.response?.status === 403) {
        req.session.numberOfSendSignInLinkAttemptsRemaining = -1;
        return res.status(403).render('login/temporarily-suspended.njk');
      }
      console.info('Failed to send sign in link. The login flow will continue as the user can retry on the next page. The error was %o', sendSignInLinkError);
    }
    return res.redirect('/login/check-your-email');
  } catch (loginError) {
    console.info('Failed to login %o', loginError);

    if (loginError.response?.status === 403) {
      return res.status(403).render('login/temporarily-suspended.njk');
    }

    loginErrors.push(emailError);
    loginErrors.push(passwordError);

    return res.render('login/index.njk', {
      errors: validationErrorHandler(loginErrors),
    });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect(LANDING_PAGES.LOGIN);
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

router.get('/login/check-your-email', validatePartialAuthToken, renderCheckYourEmailPage);
router.post('/login/check-your-email', validatePartialAuthToken, sendNewSignInLink);

router.get('/login/sign-in-link-expired', validatePartialAuthToken, (req, res) => {
  res.render('login/sign-in-link-expired.njk');
});

router.post('/login/sign-in-link-expired', validatePartialAuthToken, sendNewSignInLink);

router.get('/login/sign-in-link', loginWithSignInLink);

module.exports = router;
