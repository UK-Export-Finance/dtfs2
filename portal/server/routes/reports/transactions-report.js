import express from 'express';
import api from '../../api';
import buildReportFilters from '../buildReportFilters';
import {
  getApiData,
  requestParams,
} from '../../helpers';

const PAGESIZE = 20;
const primaryNav = 'reports';
const router = express.Router();

router.get('/reports/transactions-report', async (req, res) => res.redirect('/reports/transactions-report/0'));

router.get('/reports/transactions-report/:page', async (req, res) => {
  const { userToken } = requestParams(req);
  const reportFilters = req.session.transactionFilters;

  const filters = buildReportFilters(reportFilters, req.session.user);

  const { transactions, count } = await getApiData(
    api.transactions(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );

  const banks = await getApiData(api.banks(userToken), res);

  const pages = {
    totalPages: Math.ceil(transactions.count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('reports/transactions-report.njk', {
    pages,
    transactions,
    banks,
    primaryNav,
    subNav: 'transactions-report',
    user: req.session.user,
  });
});

export default router;
