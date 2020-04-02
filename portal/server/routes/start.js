import express from 'express';
import api from '../api';
import {
  getApiData,
  requestParams,
} from '../helpers';

const router = express.Router();

router.get('/start-now', (req, res) => res.render('start-now.njk'));

router.get('/before-you-start', async (req, res) => {
  const { userToken } = requestParams(req);

  return res.render('before-you-start/before-you-start.njk', {
    mandatoryCriteria: await getApiData(
      api.mandatoryCriteria(userToken),
      res,
    ),
  });
});

router.post('/before-you-start', async (req, res) => {
  const { criteriaMet } = req.body;

  // TODO: check as boolean
  if (criteriaMet === 'true') {
    return res.redirect('/before-you-start/bank-deal');
  }
  return res.redirect('/unable-to-proceed');
});

router.get('/before-you-start/bank-deal', (req, res) => res.render('before-you-start/before-you-start-bank-deal.njk'));

router.post('/before-you-start/bank-deal', async (req, res) => {
  const { bankDealId, bankDealName } = req.body;

  const newDeal = {
    details: {
      bankSupplyContractID: bankDealId,
      supplyContractName: bankDealName,
    },
    criteriaMet: true, // choosing only to create deals where this criteria is met, rather than record failures..
  };

  const persistedDeal = await api.createDeal(newDeal, req.session.userToken);

  res.redirect(`/contract/${persistedDeal._id}`);// eslint-disable-line no-underscore-dangle
});

router.get('/unable-to-proceed', (req, res) => res.render('unable-to-proceed.njk'));

export default router;
