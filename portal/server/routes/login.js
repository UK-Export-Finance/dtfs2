import express from 'express';
import api from '../api';
import { requestParams, generateErrorSummary, errorHref } from '../helpers';

const router = express.Router();

router.get('/', (req, res) => {
  const { passwordreset, passwordupdated } = req.query;
  return res.render('login.njk', {
    passwordreset,
    passwordupdated,
    user: req.session.user,
  });
});

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  const tokenResponse = await api.login(email, password);

  const {
    success,
    token,
    user,
  } = tokenResponse;

  if (success) {
    req.session.userToken = token;
    req.session.user = user;
    res.redirect('/dashboard/0');
  } else {
    res.status(401).render('login.njk');
  }
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
    res.redirect('/?passwordreset=1');
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

export default router;
