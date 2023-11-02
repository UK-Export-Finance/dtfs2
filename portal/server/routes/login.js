const express = require('express');
const api = require('../api');
const { requestParams, generateErrorSummary, errorHref, validationErrorHandler } = require('../helpers');
const { login } = require('../controllers/login');

const router = express.Router();

router.get('/login', (req, res) => {
  const { passwordreset, passwordupdated } = req.query;
  return res.render('login.njk', {
    passwordreset,
    passwordupdated,
    user: req.session.user,
  });
});

router.post('/login', login);

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

module.exports = router;
