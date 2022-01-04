const express = require('express');
const moment = require('moment');
const api = require('../../api');
const buildReportFilters = require('../buildReportFilters');
const {
  getApiData,
  requestParams,
} = require('../../helpers');
const downloadCsv = require('../../utils/downloadCsv');

const PAGESIZE = 20;
const primaryNav = 'reports';
const router = express.Router();

function filterLocaliseTimestamp(utcTimestamp, targetTimezone) {
  const format = 'DD/MM/YYYY HH:mm';
  if (!utcTimestamp) {
    return '';
  }

  const utc = moment(parseInt(utcTimestamp, 10));
  const localisedTimestamp = utc.tz(targetTimezone);
  return localisedTimestamp.format(format);
}

function downloadSupplyContracts(supplyContracts, timezone, res) {
  const columns = [{
    prop: 'bankInternalRefName',
    label: 'Supply Contract ID',
  }, {
    prop: 'maker_username',
    label: 'Created by',
  }, {
    prop: 'checker',
    label: 'Submitted by',
  }, {
    prop: 'status',
    label: 'Status',
  }, {
    prop: 'bank_name',
    label: 'Bank',
  }, {
    prop: 'created',
    label: 'Created',
  }, {
    prop: 'updatedAt',
    label: 'Changed',
  }, {
    prop: 'submissionDate',
    label: 'Submission date',
  }];

  // Replace nulls and missing keys with empty strings
  const rows = [];
  supplyContracts.forEach((supplyContract) => {
    // De-nest the fields we want from under details/maker/bank
    const row = {};
    Object.assign(row, supplyContract.details);
    if (supplyContract.maker) {
      row.maker_username = supplyContract.maker.username;
    }
    if (supplyContract.bank) {
      row.bank_name = supplyContract.bank.name;
    }

    // null
    Object.keys(row).forEach((key) => {
      if (row[key] === null) {
        row[key] = '';
      }
    });

    // Missing
    columns.forEach((column) => {
      if (!(column.prop in row)) {
        row[column.prop] = '';
      }
    });

    // Format dates
    row.created = filterLocaliseTimestamp(row.created, timezone);
    row.updatedAt = filterLocaliseTimestamp(row.updatedAt, timezone);
    row.submissionDate = filterLocaliseTimestamp(row.submissionDate, timezone);

    return rows.push(row);
  });

  return downloadCsv(res, 'supply_contracts', columns, rows);
}

router.get('/reports/audit-supply-contracts', async (req, res) => res.redirect('/reports/audit-supply-contracts/0'));

router.get('/reports/audit-supply-contracts/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  }

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );

  const reportFilters = req.session.supplyContractsFilters;

  const filters = buildReportFilters(reportFilters, req.session.user);

  if (req.params.page === 'download') {
    // Get all contracts for csv download
    const dealData = await getApiData(
      api.contracts(0, 0, filters, userToken),
      res,
    );
    return downloadSupplyContracts(dealData.deals, req.session.user.timezone, res);
  }

  // Get the current page
  const dealData = await getApiData(
    api.contracts(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );

  const pages = {
    totalPages: Math.ceil(dealData.count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: dealData.count,
  };

  return res.render('reports/audit-supply-contracts.njk', {
    pages,
    contracts: dealData.deals,
    banks,
    filter: {
      ...reportFilters,
    },
    primaryNav,
    subNav: 'audit-supply-contracts',
    user: req.session.user,
  });
});

router.post('/reports/audit-supply-contracts/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  }

  const reportFilters = req.body;
  if (reportFilters.bank === 'any') {
    reportFilters.bank = '';
  }

  req.session.supplyContractsFilters = reportFilters;
  return res.redirect('/reports/audit-supply-contracts/0');
});

router.get('/reports/audit-supply-contracts/:id/transactions', async (req, res) => res.redirect('/reports/audit-supply-contracts/:id/transactions/0'));

router.get('/reports/audit-supply-contracts/:id/transactions/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  }

  const idFilter = {
    _id: req.params.id,
  };

  const filters = buildReportFilters(idFilter, req.session.user);
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

module.exports = router;
