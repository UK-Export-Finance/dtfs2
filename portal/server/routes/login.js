const express = require('express');
const api = require('../api');
const {
  requestParams, generateErrorSummary, errorHref, validationErrorHandler,
} = require('../helpers');

const router = express.Router();

router.get('/login', (req, res) => {
  const { passwordreset, passwordupdated } = req.query;
  return res.render('login.njk', {
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

  if (email && password) {
    const tokenResponse = await api.login(email, password);

    const {
      success,
      token,
      user,
    } = tokenResponse;

    if (success) {
      req.session.userToken = token;
      req.session.user = user;
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
  return res.redirect('/dashboard/deals/0');
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

router.get('/reset-password', (req, res) => {
  const { passwordreseterror } = req.query;
  return res.render('reset-password.njk', {
    passwordreseterror,
  });
});

router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  const { success } = await api.resetPassword(email);

  if (success) {
    res.redirect('/login?passwordreset=1');
  } else {
    res.redirect('?passwordreseterror=1');
  }
});

router.get('/reset-password/:pwdResetToken', (req, res) => res.render('user/change-password.njk'));

router.post('/reset-password/:pwdResetToken', async (req, res) => {
  const { pwdResetToken } = requestParams(req);

  const { data } = await api.resetPasswordFromToken(pwdResetToken, req.body);

  const formattedValidationErrors = generateErrorSummary(
    data.errors,
    errorHref,
  );

  if (formattedValidationErrors && formattedValidationErrors.count > 0) {
    return res.render('user/change-password.njk',
      {
        validationErrors: formattedValidationErrors,
      });
  }

  return res.redirect('/?passwordupdated=1');
});

module.exports = router;
