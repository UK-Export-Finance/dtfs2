import express from 'express';
import api from '../api';
import {
  getApiData,
  requestParams,
} from '../helpers';

const router = express.Router();
const PAGESIZE = 20;

router.get('/reporting/audit-supply-contracts', async (req, res) => {
  return res.redirect('/reporting/audit-supply-contracts/0')
});

router.get('/reporting/audit-supply-contracts/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  const filters = {}; //TODO wire up filters; probably do same as dashboard +use session
  const dealData = await getApiData(
    api.contracts(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );

  const pages = {
    totalPages: Math.ceil(dealData.count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: dealData.count,
  };

  return res.render('reporting/audit-supply-contracts.njk', {
    pages,
    contracts: dealData.deals,
    user: req.session.user,
  });
  ;
});

export default router;
