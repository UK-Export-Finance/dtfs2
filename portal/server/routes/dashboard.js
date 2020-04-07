import express from 'express';
import api from '../api';
import buildDashboardFilters from './buildDashboardFilters';

import {
  getApiData,
  requestParams,
  getFlashSuccessMessage,
} from '../helpers';

const router = express.Router();
const PAGESIZE = 20;

router.get('/dashboard', async (req, res) => {
  res.redirect('/dashboard/0');
});

router.get('/dashboard/:page', async (req, res) => {
  const { userToken } = requestParams(req);
  const filters = buildDashboardFilters(req.params, req.session.user);

  const dealData = await getApiData(
    api.contracts(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );

  const pages = {
    totalPages: Math.ceil(dealData.count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: dealData.count,
  };

  return res.render('dashboard/deals.njk', {
    pages,
    contracts: dealData.deals,
    banks: await getApiData(
      api.banks(userToken),
      res,
    ),
    successMessage: getFlashSuccessMessage(req),
  });
});

router.post('/dashboard/:page', async (req, res) => {
  const { userToken } = requestParams(req);
  const filters = buildDashboardFilters(req.body, req.session.user);

  const dealData = await getApiData(
    api.contracts(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );

  const pages = {
    totalPages: Math.ceil(dealData.count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: dealData.count,
  };

  return res.render('dashboard/deals.njk', {
    pages,
    contracts: dealData.deals,
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
