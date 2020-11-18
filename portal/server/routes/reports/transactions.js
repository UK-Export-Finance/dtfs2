import express from 'express';
import api from '../../api';
import {
  getApiData,
  requestParams,
} from '../../helpers';

const PAGESIZE = 20;
const primaryNav = 'reports';
const router = express.Router();
router.get('/reports/:id/transactions/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  }

  const filters = {}; // TODO wire up filters; probably do same as dashboard +use session

  const { transactions, count } = await getApiData(
    api.transactions(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };
  return res.render('reports/audit-supply-transactions.njk', {
    pages,
    transactions,
    primaryNav,
    subNav: 'transactions-report',
    user: req.session.user,
  });
});

export default router;
