import express from 'express';
import api from '../api';
import {
  getApiData,
  requestParams,
} from '../helpers';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  const { userToken } = requestParams(req);

  return res.render('dashboard/deals.njk', {
    contracts: await getApiData(
      api.contracts(userToken),
      res,
    ),
    banks: await getApiData(
      api.banks(userToken),
      res,
    ),
  });
});

router.get('/dashboard/transactions', async (req, res) => {
  const { userToken } = requestParams(req);

  return res.render('dashboard/transactions.njk', {
    transactions: await getApiData(
      api.transactions(userToken),
      res,
    ),
    banks: await getApiData(
      api.banks(userToken),
      res,
    ),
  });
});

export default router;
