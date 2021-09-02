const express = require('express');
const api = require('../../api');
const {
  getApiData,
  requestParams,
} = require('../../helpers');
const buildReportFilters = require('../buildReportFilters');

const PAGESIZE = 20;
const primaryNav = 'reports';

const router = express.Router();

router.get('/reports/mia_min-cover-start-date-changes', async (req, res) => res.redirect('/reports/mia_min-cover-start-date-changes/0'));

router.get('/reports/mia_min-cover-start-date-changes/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  }

  // get deals where transaction facilityStage = unconditional/issued
  const reportFilters = req.body;
  if (reportFilters.bank === 'any') {
    reportFilters.bank = '';
  }
  const facilityFilters = buildReportFilters(reportFilters, req.session.user);

  facilityFilters.push({
    field: 'transaction.previousCoverStartDate',
    value: null,
    operator: 'ne',
  });

  const { transactions, count } = await getApiData(
    api.transactions(req.params.page * PAGESIZE, PAGESIZE, facilityFilters, userToken),
    res,
  );

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('reports/mia_min-cover-start-date-changes.njk', {
    pages,
    transactions,
    primaryNav,
    subNav: 'mia_min-cover-start-date-changes',
    user: req.session.user,
  });
});

module.exports = router;
