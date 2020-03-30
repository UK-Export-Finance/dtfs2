import express from 'express';
import api from '../api';
import {
  getApiData,
  getDealIdAndToken,
} from '../helpers';
import workflow from '../portal-workflow';

const router = express.Router();

router.get('/start-now', (req, res) => res.render('start-now.njk'));

router.get('/before-you-start', async (req, res) => {
  const { userToken } = getDealIdAndToken(req);

  return res.render('before-you-start/before-you-start.njk', {
    mandatoryCriteria: await getApiData(
      api.mandatoryCriteria(userToken),
      res,
    ),
  });
});

router.post('/before-you-start', async (req, res) => {
  const { criteriaMet } = req.body;

  const state = workflow(req.session.deal);
  await state.setCriteriaMet(criteriaMet, req.session.userToken);

  req.session.deal = state.updatedDeal();

  // TODO: check as boolean
  if (criteriaMet === 'true') {
    return res.redirect('/before-you-start/bank-deal');
  }
  return res.redirect('/unable-to-proceed');
});

router.get('/before-you-start/bank-deal', (req, res) => res.render('before-you-start/before-you-start-bank-deal.njk'));

router.post('/before-you-start/bank-deal', async (req, res) => {
  const { bankDealId, bankDealName } = req.body;

  const state = workflow(req.session.deal);
  await state.setBankDetails(bankDealId, bankDealName, req.session.userToken);

  req.session.deal = state.updatedDeal();

  res.redirect(`/contract/${req.session.deal._id}`); // eslint-disable-line no-underscore-dangle
});

router.get('/unable-to-proceed', (req, res) => res.render('unable-to-proceed.njk'));

export default router;
