import express from 'express';
import moment from 'moment';
import api from '../../api';
import buildReportFilters from '../buildReportFilters';
import {
  getApiData,
  requestParams,
} from '../../helpers';

const primaryNav = 'reports';
const router = express.Router();

router.get('/reports/reconciliation-report', async (req, res) => res.redirect('/reports/reconciliation-report/0'));

const nowMinus = (minutes) => moment().subtract(minutes, 'minutes').utc().valueOf()
  .toString();

router.get('/reports/reconciliation-report/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  }

  const reportFilters = {
    ...req.session.reconciliationFilters,
    ...req.body,
  };

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
      field: 'details.submissionDate',
      value: nowMinus(120),
      operator: 'lt',
    },
  );

  const submittedDeals = await getApiData(
    api.contracts(0, 0, filters, userToken),
    res,
  );

  const { deals } = submittedDeals;

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

  req.session.reconciliationFilters = req.body;

  return res.redirect('/reports/reconciliation-report/0');
});

export default router;
