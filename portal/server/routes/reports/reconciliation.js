import express from 'express';
import api from '../../api';
import buildReportFilters from '../buildReportFilters';
import {
  getApiData,
  requestParams,
} from '../../helpers';

const primaryNav = 'reports';
const router = express.Router();

router.get('/reports/reconciliation-report', async (req, res) => res.redirect('/reports/reconciliation-report/0'));

router.get('/reports/reconciliation-report/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  }

  const reportFilters = req.body;
  if (reportFilters.bank === 'any') {
    reportFilters.bank = '';
  }
  const filters = buildReportFilters(reportFilters, req.session.user);
  /*
  // this is the graphQL needed in the deal.controller
  const query = {
    '$or': [
      {'$and': [
        {'details.status':'Submitted'},
        {'details.workflowStatus': 'Draft'}
      ]},
      {'$or': [
        {'bondTransactions.items':{'$elemMatch':{'status':'Submitted'}}},
        {'loanTransactions.items':{'$elemMatch':{'status':'Submitted'}}}
      ]},
    ]
  };
  */
  // get deals that have been submitted (and so are awaiting response)
  // deal.details.workflowStatus = draft && status = submitted
  filters.push(
    {
      field: 'details.status',
      value: 'Submitted',
    },
  );
  filters.push(
    {
      field: 'details.workflowStatus',
      value: 'Draft',
    },
  );
  // get deals where transaction facilityStage = submitted
  const facilityFilters = buildReportFilters(reportFilters, req.session.user);
  facilityFilters.push(
    {
      field: 'transaction.status',
      value: 'Submitted',
    },
  );
  // get the deals
  const submittedDeals = await getApiData(
    api.contracts(0, 0, filters, userToken),
    res,
  );

  // get deals with submitted facilities
  const faciltyDeals = await getApiData(
    api.contracts(0, 0, facilityFilters, userToken),
    res,
  );
  // add the two lists
  const deals = submittedDeals.deals.concat(faciltyDeals.deals);

  const count = deals.length;
  // get banks for filter list
  const banks = await getApiData(api.banks(userToken), res);

  const pages = {
    // totalPages: Math.ceil(count / PAGESIZE),
    // currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('reports/reconciliation-report.njk', {
    pages,
    banks,
    deals,
    filter: {
      ...reportFilters,
    },
    primaryNav,
    subNav: 'reconciliation-report',
    user: req.session.user,
  });
});

router.post('/reports/reconciliation-report/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  }

  const reportFilters = req.body;
  if (reportFilters.bank === 'any') {
    reportFilters.bank = '';
  }
  const filters = buildReportFilters(reportFilters, req.session.user);

  filters.push(
    {
      field: 'details.status',
      value: 'Submitted',
    },
  );
  filters.push(
    {
      field: 'details.workflowStatus',
      value: 'Draft',
    },
  );
  const facilityFilters = buildReportFilters(reportFilters, req.session.user);
  facilityFilters.push(
    {
      field: 'transaction.status',
      value: 'Submitted',
    },
  );
  const submittedDeals = await getApiData(
    api.contracts(0, 0, filters, userToken),
    res,
  );
  const faciltyDeals = await getApiData(
    api.contracts(0, 0, facilityFilters, userToken),
    res,
  );
  const deals = submittedDeals.deals.concat(faciltyDeals.deals);
  const count = deals.length;
  const banks = await getApiData(api.banks(userToken), res);
  // no pagination
  const pages = {
    // totalPages: Math.ceil(count / PAGESIZE),
    // currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('reports/reconciliation-report.njk', {
    pages,
    banks,
    deals,
    filter: {
      ...reportFilters,
    },
    primaryNav,
    subNav: 'reconciliation-report',
    user: req.session.user,
  });
});

export default router;
