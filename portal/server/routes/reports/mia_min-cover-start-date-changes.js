import express from 'express';
import api from '../../api';
import {
  getApiData,
  requestParams,
} from '../../helpers';
import buildReportFilters from '../buildReportFilters';

const PAGESIZE = 20;
const primaryNav = 'reports';

const router = express.Router();

router.get('/reports/mia_min-cover-start-date-changes', async (req, res) => res.redirect('/reports/mia_min-cover-start-date-changes/0'));

router.get('/reports/mia_min-cover-start-date-changes/:page', async (req, res) => {
  const { userToken } = requestParams(req);
  // get deals where transaction facilityStage = unconditional/issued
  const reportFilters = req.body;
  if (reportFilters.bank === 'any') {
    reportFilters.bank = '';
  }
  const facilityFilters = buildReportFilters(reportFilters, req.session.user);
  facilityFilters.push(
    {
      field: 'details.status',
      value: 'Ready for Checker\'s approval',
    },
  );

  facilityFilters.push(
    {
      field: 'transaction.transactionStage',
      value: 'issued_unconditional',
    },
  );
  // TODO set up an OR query for details.previousStatus
  facilityFilters.push(
    {
      field: 'details.previousStatus',
      value: 'Accepted by UKEF (with conditions)',
    },
  );

  const facilitiesWithConditions = await getApiData(
    api.transactions(req.params.page * PAGESIZE, PAGESIZE, facilityFilters, userToken),
    res,
  );

  facilityFilters.pop();
  facilityFilters.push(
    {
      field: 'details.previousStatus',
      value: 'Accepted by UKEF (without conditions)',
    },
  );

  const facilitiesWithOutConditions = await getApiData(
    api.transactions(req.params.page * PAGESIZE, PAGESIZE, facilityFilters, userToken),
    res,
  );

  const transactions = facilitiesWithConditions.transactions.concat(facilitiesWithOutConditions.transactions);

  // the two queries breaks pagination
  const pages = {
    // totalPages: Math.ceil(facilityDeals.count / PAGESIZE),
    // currentPage: parseInt(req.params.page, 10),
    totalItems: transactions.length,
  };

  return res.render('reports/mia_min-cover-start-date-changes.njk', {
    pages,
    transactions,
    primaryNav,
    subNav: 'mia_min-cover-start-date-changes',
    user: req.session.user,
  });
});

export default router;
