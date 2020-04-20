import express from 'express';
import api from '../api';
import {
  getApiData,
  requestParams,
} from '../helpers';

const router = express.Router();
const PAGESIZE = 20;

router.get('/reporting/audit-supply-contracts', async (req, res) => res.redirect('/reporting/audit-supply-contracts/0'));

router.get('/reporting/audit-supply-contracts/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  const filters = {}; // TODO wire up filters; probably do same as dashboard +use session
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
});

router.get('/reporting/transactions-report', async (req, res) => res.redirect('/reporting/transactions-report/0'));

router.get('/reporting/transactions-report/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  const { transactions, count } = await getApiData(api.transactions(userToken), res);

  const banks = await getApiData(api.banks(userToken), res);

  const pages = {
    totalPages: Math.ceil(transactions.count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('reporting/transactions-report.njk', {
    pages,
    transactions,
    banks,
    user: req.session.user,
  });
});

router.get('/reporting/mia_min-cover-start-date-changes', async (req, res) => res.redirect('/reporting/mia_min-cover-start-date-changes/0'));

router.get('/reporting/mia_min-cover-start-date-changes/:page', async (req, res) => {
  // [dw] while mocking this report out, I don't think we really understand the data-model involved
  //  so I'm, just mocking this out the old way rather than trying to work out how to re-plumb the API.

  // const { userToken } = requestParams(req);
  // const { transactions, count } = await getApiData(api.transactions(userToken), res);
  // const banks = await getApiData(api.banks(userToken), res);
  const crs = [
    {
      bankSupplyContractID: 'Memsstar/BSS/APG',
      bankFacilityId: 'Loan 3',
      transactionType: 'Loan',
      supplierName: 'TEST DO NOT TOUCH',
      oldRequestedCoverStartDate: '08/08/2018',
      newRequestedCoverStartDate: '18/08/2018',
      dateTimeOfChange: '08/08/2018 - 09:37',
      maker: 'DurgaRao',
      checker: 'CHECKER DURGA',
    },
  ];

  const count = crs.length; // in case people want to add more examples..

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('reporting/mia_min-cover-start-date-changes.njk', {
    pages,
    crs,
    user: req.session.user,
  });
});

export default router;
