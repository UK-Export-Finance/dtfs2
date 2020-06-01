import express from 'express';
import api from '../api';

const router = express.Router();

router.get('/', (req, res) => {
  const { passwordreset } = req.query;
  return res.render('login.njk', {
    passwordreset,
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
    res.redirect('/start-now');
  } else {
    res.status(401).render('login.njk');
  }
});

router.get('/reset-password', (req, res) => res.render('reset-password.njk'));

router.post('/reset-password', (req, res) => res.redirect('/?passwordreset=1'));

export default router;
