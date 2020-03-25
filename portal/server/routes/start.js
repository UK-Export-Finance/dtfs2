import express from 'express';
import api from '../api';

const router = express.Router();

router.get('/start-now', (req, res) => res.render('start-now.njk'));

router.get('/before-you-start', async (req, res) => res.render('before-you-start/before-you-start.njk', {
  mandatoryCriteria: await api.mandatoryCriteria(req.session.userToken),
}));

router.post('/before-you-start', (req, res) => {
  const { criteriaMet } = req.body;

  // TODO: check as boolean
  if (criteriaMet === 'true') {
    return res.redirect('/before-you-start/bank-deal');
  }
  return res.redirect('/unable-to-proceed');
});

router.get('/before-you-start/bank-deal', (req, res) => res.render('before-you-start/before-you-start-bank-deal.njk'));

router.post('/before-you-start/bank-deal', (req, res) => res.redirect('/contract/1'));

router.get('/unable-to-proceed', (req, res) => res.render('unable-to-proceed.njk'));

export default router;
