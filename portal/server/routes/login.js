import express from 'express';
import api from '../api';

const router = express.Router();

router.get('/', (req, res) => res.render('login.njk'));

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  const tokenResponse = await api.login(email, password);

  const {
    success,
    token,
  } = tokenResponse;

  if (success) {
    req.session.userToken = token;
    res.redirect('/start-now');
  } else {
    res.status(401).render('login.njk');
  }
});

export default router;
