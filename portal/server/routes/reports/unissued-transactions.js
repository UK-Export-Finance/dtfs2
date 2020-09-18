import express from 'express';
import api from '../../api';
import buildReportFilters from '../buildReportFilters';
import { getExpiryDates } from '../expiryStatusUtils';
import {
  getApiData,
  requestParams,
} from '../../helpers';

const PAGESIZE = 20;
const primaryNav = 'reports';
const router = express.Router();

router.get('/reports/unissued-transactions',
  async (req, res) => res.redirect('/reports/unissued-transactions/0'));

router.get('/reports/unissued-transactions/:page', async (req, res) => {
  const { userToken } = requestParams(req);
  const fromDays = req.query.fromDays || 0;
  const toDays = req.query.toDays || 90;

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );

  const sortOrder = {
    queryString: `${req.params.page}?fromDays=${fromDays}&toDays=${toDays}&sort=desc`,
    order: 'ascending',
    image: 'twistie-up',
  };

  const stageFilters = {
    facilityStage: 'unissued_conditional',
    filterByStatus: 'submissionAcknowledged',
  };
  const filters = buildReportFilters(stageFilters, req.session.user);

  const rawData = await getApiData(
    api.transactions(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );
  rawData.transactions = getExpiryDates(rawData.transactions, 90, false);

  let transactions = [];
  if (fromDays > 0) {
    transactions = rawData.transactions.filter(
      (transaction) => transaction.remainingDays >= fromDays && transaction.remainingDays <= toDays,
    );
  } else {
    transactions = rawData.transactions.filter(
      (transaction) => transaction.remainingDays <= toDays,
    );
  }

  // default order from getExpiryDates is asc
  if (transactions.length > 0 && req.query && req.query.sort && req.query.sort === 'desc') {
    transactions.sort((a, b) => parseFloat(b.remainingDays) - parseFloat(a.remainingDays));
    sortOrder.queryString = `${req.params.page}?fromDays=${fromDays}&toDays=${toDays}`;
    sortOrder.order = 'descending';
    sortOrder.image = 'twistie-down';
  }

  const count = transactions.length;

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('reports/unissued-transactions-report.njk', {
    pages,
    transactions,
    primaryNav,
    banks,
    sortOrder,
    subNav: 'unissued-transactions-report',
    user: req.session.user,
  });
});

router.post('/reports/unissued-transactions/:page', async (req, res) => {
  const { userToken } = requestParams(req);
  const fromDays = req.query.fromDays || 0;
  const toDays = req.query.toDays || 90;

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  }

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );

  const submissionFilters = req.body;
  if (submissionFilters.bank === 'any') {
    submissionFilters.bank = '';
  }

  const sortOrder = {
    queryString: `${req.params.page}?fromDays=${fromDays}&toDays=${toDays}&sort=desc`,
    order: 'ascending',
    image: 'twistie-up',
  };

  const stageFilters = {
    facilityStage: 'unissued_conditional',
    filterByStatus: 'submissionAcknowledged',
  };

  const useFilters = { ...submissionFilters, ...stageFilters };

  const filters = buildReportFilters(useFilters, req.session.user);

  const rawData = await getApiData(
    api.transactions(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );
  rawData.transactions = getExpiryDates(rawData.transactions, 90, false);

  let transactions = [];
  if (fromDays > 0) {
    transactions = rawData.transactions.filter(
      (transaction) => transaction.remainingDays >= fromDays && transaction.remainingDays <= toDays,
    );
  } else {
    transactions = rawData.transactions.filter(
      (transaction) => transaction.remainingDays <= toDays,
    );
  }

  // default order from getExpiryDates is asc
  if (transactions.length > 0 && req.query && req.query.sort && req.query.sort === 'desc') {
    transactions.sort((a, b) => parseFloat(b.remainingDays) - parseFloat(a.remainingDays));
    sortOrder.queryString = `${req.params.page}?fromDays=${fromDays}&toDays=${toDays}`;
    sortOrder.order = 'descending';
    sortOrder.image = 'twistie-down';
  }

  const count = transactions.length;

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('reports/unissued-transactions-report.njk', {
    pages,
    transactions,
    primaryNav,
    banks,
    filter: {
      ...useFilters,
    },
    sortOrder,
    subNav: 'unissued-transactions-report',
    user: req.session.user,
  });
});

export default router;
