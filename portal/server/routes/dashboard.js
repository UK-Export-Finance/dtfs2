import express from 'express';
import api from '../api';
import buildTransactionFilters from './buildTransactionFilters';
import {
  getApiData,
  requestParams,
  getFlashSuccessMessage,
} from '../helpers';
import dealsDashboard from '../controllers/dashboard';

import validateToken from './middleware/validate-token';

const router = express.Router();
const PAGESIZE = 20;
const primaryNav = 'home';

router.use('/dashboard/*', validateToken);

router.get('/', validateToken, (_, res) => res.redirect('/dashboard/0'));

router.get('/dashboard', async (req, res) => {
  req.session.dashboardFilters = null;
  res.redirect('/dashboard/0');
});

router.get('/dashboard/transactions', async (req, res) => {
  req.session.transactionFilters = null;
  return res.redirect('/dashboard/transactions/0');
});

router.get('/dashboard/transactions/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  const { isUsingAdvancedFilter, filters } = buildTransactionFilters(req.session.transactionFilters, req.session.user);

  const transactionData = await getApiData(
    api.transactions(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );

  const pages = {
    totalPages: Math.ceil(transactionData.count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: transactionData.count,
  };

  return res.render('dashboard/transactions.njk', {
    pages,
    transactions: transactionData.transactions,
    banks: await getApiData(
      api.banks(userToken),
      res,
    ),
    successMessage: getFlashSuccessMessage(req),
    filter: {
      isUsingAdvancedFilter,
      ...req.session.transactionFilters,
    },
    primaryNav,
    user: req.session.user,
  });
});

router.post('/dashboard/transactions/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  const transactionFilters = req.body;

  req.session.transactionFilters = transactionFilters;

  const { isUsingAdvancedFilter, filters } = buildTransactionFilters(transactionFilters, req.session.user);

  const transactionData = await getApiData(
    api.transactions(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );

  const pages = {
    totalPages: Math.ceil(transactionData.count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: transactionData.count,
  };

  return res.render('dashboard/transactions.njk', {
    pages,
    transactions: transactionData.transactions,
    banks: await getApiData(
      api.banks(userToken),
      res,
    ),
    successMessage: getFlashSuccessMessage(req),
    filter: {
      isUsingAdvancedFilter,
      ...req.session.transactionFilters,
    },
    user: req.session.user,
  });
});

// needs to be ordered last to avoid issues with taking priority over transaction routes
router.get('/dashboard/:page', dealsDashboard);

export default router;
