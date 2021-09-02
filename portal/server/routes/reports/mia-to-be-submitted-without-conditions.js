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

router.get('/reports/mia-to-be-submitted/without-conditions/:page', async (req, res) => {
  // TODO wire up getMIAData function
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  }

  const filterByDealStatus = 'Accepted by UKEF (without conditions)';

  let maxDays = 10;
  let workingDays = 14;
  if (filterByDealStatus === 'Accepted by UKEF (with conditions)') {
    workingDays = 28;
    maxDays = 20;
  }
  const fromDays = req.query.fromDays || 0;
  const toDays = req.query.toDays || maxDays;

  const submissionFilters = {
    ...req.session.miaToBeSubmittedWithoutConditionsFilters,
    filterBySubmissionType: 'manualInclusionApplication',
  };

  const MIAfilters = buildReportFilters(submissionFilters, req.session.user);
  const applications = await getApiData(
    api.contracts(0, 0, MIAfilters, userToken),
    res,
  );

  let miaWithConditions = [];
  let tempDeals = [];
  let deals = [];
  let count = 0;
  if (applications.deals) {
    miaWithConditions = applications.deals.filter((deal) => (deal.details.status === filterByDealStatus));
    tempDeals = getExpiryDates(miaWithConditions, workingDays, true);
    // once we have the deals and expiry dates, filter the display
    if (fromDays > 0) {
      deals = tempDeals.filter(
        (deal) => deal.remainingDays >= fromDays && deal.remainingDays <= toDays,
      );
    } else {
      deals = tempDeals.filter(
        (deal) => deal.remainingDays <= toDays,
      );
    }
    count = deals.length;
  }

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );
  // const banks = [{ id: 1, name: 'HSBC' }, { id: 2, name: 'NatWest' }];
  const sortOrder = {
    queryString: `${req.params.page}?fromDays=${fromDays}&toDays=${toDays}&sort=desc`,
    order: 'ascending',
    image: 'twistie-up',
  };

  // default order from getExpiryDates is asc
  if (req.query && req.query.sort && req.query.sort === 'desc') {
    if (deals) {
      deals.sort((a, b) => parseFloat(b.remainingDays) - parseFloat(a.remainingDays));
    }
    sortOrder.queryString = `${req.params.page}?fromDays=${fromDays}&toDays=${toDays}`;
    sortOrder.order = 'descending';
    sortOrder.image = 'twistie-down';
  }

  return res.render('reports/MIA-to-be-submitted-report.njk', {
    pages,
    conditions: 'without',
    deals,
    banks,
    sortOrder,
    primaryNav,
    subNav: 'countdown-indicator',
    user: req.session.user,
  });
});

router.post('/reports/mia-to-be-submitted/without-conditions/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  }

  const filters = req.body;
  if (filters.bank === 'any') {
    filters.bank = '';
  }

  req.session.miaToBeSubmittedWithoutConditionsFilters = filters;

  return res.redirect('/reports/mia-to-be-submitted/without-conditions/0');
});

module.exports = router;
