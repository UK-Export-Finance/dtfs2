const express = require('express');
const api = require('../../api');
const buildReportFilters = require('../buildReportFilters');
const { getExpiryDates } = require('../expiryStatusUtils');
const {
  getApiData,
  requestParams,
} = require('../../helpers');

const PAGESIZE = 20;
const primaryNav = 'reports';
const router = express.Router();

router.get('/reports/unissued-transactions', async (req, res) => res.redirect('/reports/unissued-transactions/0'));

router.get('/reports/unissued-transactions/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  }

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
    ...req.session.unissuedTransactionsFilters,
    facilityStage: 'unissued_conditional',
    filterByStatus: 'submissionAcknowledged',
  };

  const filters = buildReportFilters(stageFilters, req.session.user);

  const allData = await getApiData(
    api.transactions(0, 0, filters, userToken),
    res,
  );
  allData.transactions = getExpiryDates(allData.transactions, 90, false);

  let allTransactions = [];
  if (fromDays > 0) {
    allTransactions = allData.transactions.filter(
      (transaction) => transaction.remainingDays >= fromDays && transaction.remainingDays <= toDays,
    );
  } else {
    allTransactions = allData.transactions.filter(
      (transaction) => transaction.remainingDays <= toDays,
    );
  }

  const count = allTransactions.length;

  allData.transactions = getExpiryDates(allData.transactions, 90, false);

  let transactions = [];
  if (fromDays > 0) {
    transactions = allData.transactions.filter(
      (transaction) => transaction.remainingDays >= fromDays && transaction.remainingDays <= toDays,
    ).slice(req.params.page * PAGESIZE, req.params.page * PAGESIZE + PAGESIZE);
  } else {
    transactions = allData.transactions.filter(
      (transaction) => transaction.remainingDays <= toDays,
    ).slice(req.params.page * PAGESIZE, req.params.page * PAGESIZE + PAGESIZE);
  }

  // default order from getExpiryDates is asc
  if (transactions.length > 0 && req.query && req.query.sort && req.query.sort === 'desc') {
    transactions.sort((a, b) => parseFloat(b.remainingDays) - parseFloat(a.remainingDays));
    sortOrder.queryString = `${req.params.page}?fromDays=${fromDays}&toDays=${toDays}`;
    sortOrder.order = 'descending';
    sortOrder.image = 'twistie-down';
  }

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('reports/unissued-transactions-report.njk', {
    pages,
    count,
    allTransactions,
    transactions,
    primaryNav,
    banks,
    filter: {
      ...filters,
    },
    sortOrder,
    subNav: 'unissued-transactions-report',
    user: req.session.user,
    request: req,
    queryString: `?fromDays=${fromDays}&toDays=${toDays}`,
  });
});

router.post('/reports/unissued-transactions/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  }

  const filters = req.body;
  if (filters.bank === 'any') {
    filters.bank = '';
  }

  req.session.unissuedTransactionsFilters = filters;

  return res.redirect('/reports/unissued-transactions/0');
});

module.exports = router;
