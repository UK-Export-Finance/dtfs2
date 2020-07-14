import express from 'express';
import api from '../api';
import { requestParams } from '../helpers';

const router = express.Router();

router.get('/feedback', (req, res) => res.render('feedback.njk', { user: req.session.user }));

router.post('/feedback', async (req, res) => {
  const { userToken } = requestParams(req);

  const response = await api.createFeedback(req.body, userToken);

  if (response) {
    // thank you page?
    return res.redirect('/feedback');
  }

  return res.redirect('/feedback');
});

export default router;
