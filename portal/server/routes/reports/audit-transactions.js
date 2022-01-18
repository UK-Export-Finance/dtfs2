const express = require('express');
const moment = require('moment');

const api = require('../../api');
const buildReportFilters = require('../buildReportFilters');
const {
  getApiData,
  requestParams,
} = require('../../helpers');
const { FACILITY_STAGE } = require('../../constants');
const downloadCsv = require('../../utils/downloadCsv');

require('moment-timezone');// monkey-patch to provide moment().tz()

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

function downloadTransactions(transactions, timezone, res) {
  const columns = [{
    value: 'deal_bank',
    label: 'Bank',
  }, {
    value: 'deal_bankInternalRefName',
    label: 'Bank Supply contract ID',
  }, {
    value: 'deal_status',
    label: 'Deal status',
  }, {
    value: 'bankFacilityId',
    label: 'Transaction ID',
  }, {
    value: 'transactionType',
    label: 'Transaction type',
  }, {
    value: 'deal_supplierName',
    label: 'Supplier name',
  }, {
    value: 'value',
    label: 'Facility value',
  }, {
    value: 'transactionStage',
    label: 'Facility stage',
  }, {
    value: 'deal_created',
    label: 'Created date',
  }, {
    value: 'maker',
    label: 'Created by',
  }, {
    value: 'issuedDate',
    label: 'Issued date',
  }, {
    value: 'submittedBy',
    label: 'Issued by',
  }];

  // Replace nulls and missing keys with empty strings
  const rows = [];
  transactions.forEach((transaction) => {
    const row = {};
    Object.assign(row, transaction);

    // null
    Object.keys(row).forEach((key) => {
      if (row[key] === null) {
        row[key] = '';
      }
    });

    // Missing
    columns.forEach((column) => {
      if (!(column.value in row)) {
        row[column.value] = '';
      }
    });

    // Format dates
    row.deal_created = filterLocaliseTimestamp(row.deal_created, timezone);
    row.issuedDate = filterLocaliseTimestamp(row.issuedDate, timezone);

    return rows.push(row);
  });

  return downloadCsv(res, 'transactions', columns, rows);
}

router.get('/reports/audit-transactions', async (req, res) => res.redirect('/reports/audit-transactions/0'));

router.get('/reports/audit-transactions/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  }

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );

  const reportFilters = req.session.transactionsFilters;

  const filters = buildReportFilters(reportFilters, req.session.user);

  if (req.params.page === 'download') {
    // Get all transactions for csv download
    const { transactions } = await getApiData(
      api.transactions(0, 0, filters, userToken),
      res,
    );
    return downloadTransactions(transactions, req.session.user.timezone, res);
  }

  // Get the current page
  const { transactions, count } = await getApiData(
    api.transactions(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('reports/audit-transactions.njk', {
    pages,
    transactions,
    banks,
    filter: {
      ...reportFilters,
    },
    facilityStages: FACILITY_STAGE,
    primaryNav,
    subNav: 'audit-transactions',
    user: req.session.user,
  });
});

router.post('/reports/audit-transactions/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  }

  const reportFilters = req.body;
  if (reportFilters.bank === 'any') {
    reportFilters.bank = '';
  }

  req.session.transactionsFilters = reportFilters;

  return res.redirect('/reports/audit-transactions/0');
});

module.exports = router;
