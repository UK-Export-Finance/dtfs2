import express from 'express';
import miaToBeSubmittedWithConditions from './mia-to-be-submitted-with-conditions';
import miaToBeSubmittedWithoutConditions from './mia-to-be-submitted-without-conditions';
import auditSupplyContracts from './audit-supply-contracts';
import unissuedTransactions from './unissued-transactions';
import countdownIndicator from './countdown-indicator';
import auditTransactions from './audit-transactions';
import reconciliation from './reconciliation';
import transactions from './transactions';
import transactionReport from './transactions-report';
import miaMinCoverStartDateChanges from './mia_min-cover-start-date-changes';


const primaryNav = 'reports';


const router = express.Router();

// Default redirect until we put in a nav.
router.get('/reports', async (req, res) => {
  const test = 1;
  return res.render('reports/reports.njk', {
    test,
    primaryNav,
    user: req.session.user,
  });
});

<<<<<<< HEAD
function downloadSupplyContracts(supplyContracts, timezone, res) {
  const columns = [{
    prop: 'bankSupplyContractID',
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
    prop: 'owningBank_name',
    label: 'Bank',
  }, {
    prop: 'created',
    label: 'Created',
  }, {
    prop: 'dateOfLastAction',
    label: 'Changed',
  }, {
    prop: 'submissionDate',
    label: 'Submission date',
  }];

  // Replace nulls and missing keys with empty strings
  const rows = [];
  supplyContracts.forEach((supplyContract) => {
    // De-nest the fields we want from under details/maker/owningBank
    const row = {};
    Object.assign(row, supplyContract.details);
    if (supplyContract.details.maker) {
      row.maker_username = supplyContract.details.maker.username;
    }
    if (supplyContract.details.owningBank) {
      row.owningBank_name = supplyContract.details.owningBank.name;
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
    row.dateOfLastAction = filterLocaliseTimestamp(row.dateOfLastAction, timezone);
    row.submissionDate = filterLocaliseTimestamp(row.submissionDate, timezone);

    return rows.push(row);
  });

  return res.csv('supply_contracts', rows, columns);
}

router.get('/reports/audit-supply-contracts', async (req, res) => res.redirect('/reports/audit-supply-contracts/0'));

router.get('/reports/audit-supply-contracts/:page', async (req, res) => {
  const { userToken } = requestParams(req);

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

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );

  const filters = buildReportFilters(reportFilters, req.session.user);
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

function downloadTransactions(transactions, timezone, res) {
  const columns = [{
    prop: 'deal_owningBank',
    label: 'Bank',
  }, {
    prop: 'deal_bankSupplyContractID',
    label: 'Bank Supply contract ID',
  }, {
    prop: 'deal_status',
    label: 'Deal status',
  }, {
    prop: 'bankFacilityId',
    label: 'Transaction ID',
  }, {
    prop: 'transactionType',
    label: 'Transaction type',
  }, {
    prop: 'deal_supplierName',
    label: 'Supplier name',
  }, {
    prop: 'facilityValue',
    label: 'Facility value',
  }, {
    prop: 'transactionStage',
    label: 'Facility stage',
  }, {
    prop: 'deal_created',
    label: 'Created date',
  }, {
    prop: 'maker',
    label: 'Created by',
  }, {
    prop: 'issuedDate',
    label: 'Issued date',
  }, {
    prop: 'submittedBy',
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
      if (!(column.prop in row)) {
        row[column.prop] = '';
      }
    });

    // Format dates
    row.deal_created = filterLocaliseTimestamp(row.deal_created, timezone);
    row.issuedDate = filterLocaliseTimestamp(row.issuedDate, timezone);

    return rows.push(row);
  });

  return res.csv('transactions', rows, columns);
}

router.get('/reports/audit-transactions', async (req, res) => res.redirect('/reports/audit-transactions/0'));

router.get('/reports/audit-transactions/:page', async (req, res) => {
  const { userToken } = requestParams(req);

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
    facilityStages: CONSTANTS.FACILITY_STAGE,
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

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );

  const filters = buildReportFilters(reportFilters, req.session.user);
  const transactionData = await getApiData(
    api.transactions(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );

  const pages = {
    totalPages: Math.ceil(transactionData.count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: transactionData.count,
  };

  return res.render('reports/audit-transactions.njk', {
    pages,
    transactions: transactionData.transactions,
    banks,
    filter: {
      ...reportFilters,
    },
    facilityStages: CONSTANTS.FACILITY_STAGE,
    primaryNav,
    subNav: 'audit-transactions',
    user: req.session.user,
  });
});

router.get('/reports/audit-supply-contracts/:id/transactions', async (req, res) => res.redirect('/reports/audit-supply-contracts/:id/transactions/0'));

router.get('/reports/audit-supply-contracts/:id/transactions/:page', async (req, res) => {
  const { userToken } = requestParams(req);

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

router.get('/reports/:id/transactions/:page', async (req, res) => {
  const { userToken } = requestParams(req);
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

// router.get('/reports/all-transactions-report',
//   async (req, res) => res.redirect('/reports/all-transactions-report/0'));

// router.get('/reports/all-transactions-report/:page', async (req, res) => {
//   const { userToken } = requestParams(req);

// const { transactions, count } = await getApiData(
//   api.transactions(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
//   res,
// );

//   const banks = await getApiData(api.banks(userToken), res);

//   const pages = {
//     totalPages: Math.ceil(transactions.count / PAGESIZE),
//     currentPage: parseInt(req.params.page, 10),
//     totalItems: count,
//   };

//   return res.render('reports/all-transactions-report.njk', {
//     pages,
//     transactions,
//     banks,
//     primaryNav,
//     subNav: 'all-transactions-report',
//     user: req.session.user,
//   });
// });

router.get('/reports/mia_min-cover-start-date-changes', async (req, res) => res.redirect('/reports/mia_min-cover-start-date-changes/0'));

router.get('/reports/mia_min-cover-start-date-changes/:page', async (req, res) => {
  const { userToken } = requestParams(req);
  // get deals where transaction facilityStage = unconditional/issued
  const reportFilters = req.body;
  if (reportFilters.bank === 'any') {
    reportFilters.bank = '';
  }
  const facilityFilters = buildReportFilters(reportFilters, req.session.user);

  facilityFilters.push({
    field: 'transaction.previousCoverStartDate',
    value: null,
    operator: 'ne',
  });

  const { transactions, count } = await getApiData(
    api.transactions(req.params.page * PAGESIZE, PAGESIZE, facilityFilters, userToken),
    res,
  );

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('reports/mia_min-cover-start-date-changes.njk', {
    pages,
    transactions,
    primaryNav,
    subNav: 'mia_min-cover-start-date-changes',
    user: req.session.user,
  });
});

router.get('/reports/reconciliation-report', async (req, res) => res.redirect('/reports/reconciliation-report/0'));

const nowMinus = (minutes) => moment().subtract(minutes, 'minutes').utc().valueOf()
  .toString();

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

  const submittedDeals = await getApiData(
    api.contracts(0, 0, filters, userToken),
    res,
  );

  const { deals } = submittedDeals;
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

router.get('/reports/countdown-indicator', async (req, res) => {
  // [dw] while mocking this report out, I don't think we really understand the data-model involved
  //  so I'm, just mocking this out the old way rather than trying to work out how to re-plumb the API.
  const { userToken } = requestParams(req);

  // need to query mongo and filter on multiple fields:
  // I've filtered the deals (MIA/MIN) on the main record submission type
  // then filtered the array locally
  // - STATUS:submissionAcknowledged + TRANSACTION_STAGE:unissued_conditional
  // - SUBMISSION_TYPE:manualInclusionApplication + STATUS:approved + MIN not issued
  // - SUBMISSION_TYPE:manualInclusionApplication + STATUS:approvedWithConditions + MIN not submitted
  const stageFilters = { // TODO use CONSTANTS lowercase string
    facilityStage: 'unissued_conditional',
    filterByStatus: 'submissionAcknowledged',
  };
  const submissionFilters = {
    filterBySubmissionType: 'manualInclusionApplication',
  };

  const filters = buildReportFilters(stageFilters, req.session.user);
  const MIAfilters = buildReportFilters(submissionFilters, req.session.user);

  // get all transactions
  const { transactions } = await getApiData(
    api.transactions(0, PAGESIZE, filters, userToken),
    res,
  );

  const applications = await getApiData(
    api.contracts(0, 0, MIAfilters, userToken),
    res,
  );

  // mock up by filtering here on conditional or unissued
  const incompleteFacilities = transactions;
  const miaWithConditions = applications.deals.filter((deal) => (deal.details.status === 'Accepted by UKEF (with conditions)'));
  const miaWithOutConditions = applications.deals.filter((deal) => (deal.details.status === 'Accepted by UKEF (without conditions)'));

  const status90Days = getRAGstatus(incompleteFacilities, 90, false);
  const status20Days = getRAGstatus(miaWithConditions, 28, true);
  const status10Days = getRAGstatus(miaWithOutConditions, 14, true);

  const issueOrMakeFirstAdvance = {
    caption: 'You have 3 months to issue or make first advance under a transaction.',
    firstCellIsHeader: true,
    head: [{ text: 'Days remaining' }, { text: 'Facilities' }],
    rows: [
      [{ text: '0 to 15' }, { html: `<strong class="govuk-tag govuk-tag--red">${status90Days.red}</strong> &nbsp; <a href="/reports/unissued-transactions/0?fromDays=0&toDays=15" >view</a>` }],
      [{ text: '16 to 45' }, { html: `<strong class="govuk-tag govuk-tag--orange">${status90Days.orange}</strong> &nbsp; <a href="/reports/unissued-transactions/0?fromDays=16&toDays=45" >view</a>` }],
      [{ text: '46 to 90' }, { html: `<strong class="govuk-tag govuk-tag--green">${status90Days.green}</strong> &nbsp; <a href="/reports/unissued-transactions/0?fromDays=46&toDays=90" >view</a>` }],
    ],
  };

  const manualInclusionsWithConditions = {
    caption: 'Manual Inclusion Applications accepted by UKEF (with conditions)',
    firstCellIsHeader: true,
    head: [{ text: 'Days remaining' }, { text: 'Supply Contracts' }, { text: '' }],
    rows: [
      [{ text: '0 to 6' }, { html: `<strong class="govuk-tag govuk-tag--red">${status20Days.red}</strong> &nbsp; <a href="/reports/mia-to-be-submitted/with-conditions/0?fromDays=0&toDays=6" >view</a>` }],
      [{ text: '7 to 13' }, { html: `<strong class="govuk-tag govuk-tag--orange">${status20Days.orange}</strong> &nbsp; <a href="/reports/mia-to-be-submitted/with-conditions/0?fromDays=7&toDays=13" >view</a>` }],
      [{ text: '14 to 20' }, { html: `<strong class="govuk-tag govuk-tag--green">${status20Days.green}</strong> &nbsp; <a href="/reports/mia-to-be-submitted/with-conditions/0?fromDays=14&toDays=20" >view</a>` }],
    ],
  };
  /*
  if (status20Days.negative > 0) {
    const row = [{ text: 'OVERDUE' },
    { html: `<strong class="govuk-tag govuk-tag--red">${status20Days.negative}</strong>
    &nbsp; <a href="/reports/mia-to-be-submitted/with-conditions" >view</a>` }];
    manualInclusionsWithConditions.rows.unshift(row);
  } */
  if (status20Days.negative === 0
    && status20Days.red === 0
    && status20Days.orange === 0
    && status20Days.green === 0) {
    status20Days.message = 'No data found.';
  }

  const manualInclusionsWithoutConditions = {
    caption: 'Manual Inclusion Applications accepted by UKEF (without conditions)',
    firstCellIsHeader: true,
    head: [{ text: 'Days remaining' }, { text: 'Supply Contracts' }, { text: '' }],
    rows: [
      [{ text: '0 to 5' }, { html: `<strong class="govuk-tag govuk-tag--red">${status10Days.red}</strong> &nbsp; <a href="/reports/mia-to-be-submitted/without-conditions/0?fromDays=0&toDays=5" >view</a>` }],
      [{ text: '6 to 7' }, { html: `<strong class="govuk-tag govuk-tag--orange">${status10Days.orange}</strong> &nbsp; <a href="/reports/mia-to-be-submitted/without-conditions/0?fromDays=6&toDays=7" >view</a>` }],
      [{ text: '8 to 10' }, { html: `<strong class="govuk-tag govuk-tag--green">${status10Days.green}</strong> &nbsp; <a href="/reports/mia-to-be-submitted/without-conditions/0?fromDays=8&toDays=10" >view</a>` }],
    ],
  };
  /*
  if (status10Days.negatives > 0) {
    const row = [{ text: 'OVERDUE' },
    { html: `<strong class="govuk-tag govuk-tag--red">${status10Days.negative}</strong>
    &nbsp; <a href="/reports/mia-to-be-submitted/without-conditions" >view</a>` }];
    manualInclusionsWithoutConditions.rows.unshift(row);
  }
  */
  if (status10Days.negative === 0
    && status10Days.red === 0
    && status10Days.orange === 0
    && status10Days.green === 0) {
    status10Days.message = 'No data found.';
  }

  const reportData = {
    issueOrMakeFirstAdvance,
    manualInclusionsWithConditions,
    manualInclusionsWithoutConditions,
  };

  return res.render('reports/countdown-indicator.njk', {
    reportData,
    status10Days,
    status20Days,
    status90Days,
    primaryNav,
    subNav: 'countdown-indicator',
    user: req.session.user,
  });
});

router.get('/reports/mia-to-be-submitted/with-conditions/:page', async (req, res) => {
  // TODO wire up getMIAData function
  const filterByDealStatus = 'Accepted by UKEF (with conditions)';
  const { userToken } = requestParams(req);
  let maxDays = 10;
  let workingDays = 14;
  if (filterByDealStatus === 'Accepted by UKEF (with conditions)') {
    workingDays = 28;
    maxDays = 20;
  }
  const fromDays = req.query.fromDays || 0;
  const toDays = req.query.toDays || maxDays;


  const submissionFilters = {
    filterBySubmissionType: 'manualInclusionApplication',
  };

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );
  // const banks = [{ id: 1, name: 'HSBC' }, { id: 2, name: 'NatWest' }];


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
    conditions: 'with',
    deals,
    banks,
    sortOrder,
    primaryNav,
    subNav: 'countdown-indicator',
    user: req.session.user,
  });
});


router.post('/reports/mia-to-be-submitted/with-conditions/:page', async (req, res) => {
  // TODO wire up getMIAData function
  const filterByDealStatus = 'Accepted by UKEF (with conditions)';
  const { userToken } = requestParams(req);
  let maxDays = 10;
  let workingDays = 14;
  if (filterByDealStatus === 'Accepted by UKEF (with conditions)') {
    workingDays = 28;
    maxDays = 20;
  }
  const fromDays = req.query.fromDays || 0;
  const toDays = req.query.toDays || maxDays;

  const submissionFilters = req.body;
  if (submissionFilters.bank === 'any') {
    submissionFilters.bank = '';
  }
  submissionFilters.filterBySubmissionType = 'manualInclusionApplication';

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );
  // const banks = [{ id: 1, name: 'HSBC' }, { id: 2, name: 'NatWest' }];

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
    conditions: 'with',
    deals,
    banks,
    sortOrder,
    primaryNav,
    subNav: 'countdown-indicator',
    user: req.session.user,
  });
});

router.get('/reports/mia-to-be-submitted/without-conditions/:page', async (req, res) => {
  // TODO wire up getMIAData function
  const filterByDealStatus = 'Accepted by UKEF (without conditions)';
  const { userToken } = requestParams(req);
  let maxDays = 10;
  let workingDays = 14;
  if (filterByDealStatus === 'Accepted by UKEF (with conditions)') {
    workingDays = 28;
    maxDays = 20;
  }
  const fromDays = req.query.fromDays || 0;
  const toDays = req.query.toDays || maxDays;


  const submissionFilters = {
    filterBySubmissionType: 'manualInclusionApplication',
  };

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );
  // const banks = [{ id: 1, name: 'HSBC' }, { id: 2, name: 'NatWest' }];


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
    conditions: 'with',
    deals,
    filter: {
      ...submissionFilters,
    },
    banks,
    sortOrder,
    primaryNav,
    subNav: 'countdown-indicator',
    user: req.session.user,
  });
});


router.post('/reports/mia-to-be-submitted/with-conditions/:page', async (req, res) => {
  // TODO wire up getMIAData function
  const filterByDealStatus = 'Accepted by UKEF (with conditions)';
  const { userToken } = requestParams(req);
  let maxDays = 10;
  let workingDays = 14;
  if (filterByDealStatus === 'Accepted by UKEF (with conditions)') {
    workingDays = 28;
    maxDays = 20;
  }
  const fromDays = req.query.fromDays || 0;
  const toDays = req.query.toDays || maxDays;

  const submissionFilters = req.body;
  if (submissionFilters.bank === 'any') {
    submissionFilters.bank = '';
  }
  submissionFilters.filterBySubmissionType = 'manualInclusionApplication';

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );
  // const banks = [{ id: 1, name: 'HSBC' }, { id: 2, name: 'NatWest' }];

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
  // TODO wire up getMIAData function
  const filterByDealStatus = 'Accepted by UKEF (without conditions)';
  const { userToken } = requestParams(req);
  let maxDays = 10;
  let workingDays = 14;
  if (filterByDealStatus === 'Accepted by UKEF (with conditions)') {
    workingDays = 28;
    maxDays = 20;
  }
  const fromDays = req.query.fromDays || 0;
  const toDays = req.query.toDays || maxDays;

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  }

  const submissionFilters = req.body;
  if (submissionFilters.bank === 'any') {
    submissionFilters.bank = '';
  }
  submissionFilters.filterBySubmissionType = 'manualInclusionApplication';


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
<<<<<<< HEAD:portal/server/routes/reports/index.js
    filter: {
      ...submissionFilters,
    },
=======
>>>>>>> countdown indicator report changes:portal/server/routes/reports.js
    banks,
    sortOrder,
    primaryNav,
    subNav: 'countdown-indicator',
    user: req.session.user,
  });
});


router.get('/reports/unissued-transactions',
  async (req, res) => res.redirect('/reports/unissued-transactions/0'));

router.get('/reports/unissued-transactions/:page', async (req, res) => {
  const { userToken } = requestParams(req);
  const fromDays = req.query.fromDays || 0;
  const toDays = req.query.toDays || 90;

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );

  const sortOrder = {
    queryString: `${req.params.page}?fromDays=${fromDays}&toDays=${toDays}&sort=desc`,
    order: 'ascending',
    image: 'twistie-up',
  };

  const stageFilters = {
    facilityStage: 'unissued_conditional',
    filterByStatus: 'submissionAcknowledged',
  };
  const filters = buildReportFilters(stageFilters, req.session.user);

  const rawData = await getApiData(
    api.transactions(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );
  rawData.transactions = getExpiryDates(rawData.transactions, 90, false);

  let transactions = [];
  if (fromDays > 0) {
    transactions = rawData.transactions.filter(
      (transaction) => transaction.remainingDays >= fromDays && transaction.remainingDays <= toDays,
    );
  } else {
    transactions = rawData.transactions.filter(
      (transaction) => transaction.remainingDays <= toDays,
    );
  }

  // default order from getExpiryDates is asc
  if (transactions.length > 0 && req.query && req.query.sort && req.query.sort === 'desc') {
    transactions.sort((a, b) => parseFloat(b.remainingDays) - parseFloat(a.remainingDays));
    sortOrder.queryString = `${req.params.page}?fromDays=${fromDays}&toDays=${toDays}`;
    sortOrder.order = 'descending';
    sortOrder.image = 'twistie-down';
  }

  const count = transactions.length;

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('reports/unissued-transactions-report.njk', {
    pages,
    transactions: rawData,
    primaryNav,
    banks,
    sortOrder,
    subNav: 'unissued-transactions-report',
    user: req.session.user,
  });
});

<<<<<<< HEAD:portal/server/routes/reports.js
=======
router.post('/reports/unissued-transactions/:page', async (req, res) => {
  const { userToken } = requestParams(req);
  const fromDays = req.query.fromDays || 0;
  const toDays = req.query.toDays || 90;

  if (!await api.validateToken(userToken)) {
    res.redirect('/');
  }

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );

  const submissionFilters = req.body;
  if (submissionFilters.bank === 'any') {
    submissionFilters.bank = '';
  }

  const sortOrder = {
    queryString: `${req.params.page}?fromDays=${fromDays}&toDays=${toDays}&sort=desc`,
    order: 'ascending',
    image: 'twistie-up',
  };


  const stageFilters = {
    facilityStage: 'unissued_conditional',
    filterByStatus: 'submissionAcknowledged',
  };
  const filters = buildReportFilters(submissionFilters, stageFilters, req.session.user);

  const rawData = await getApiData(
    api.transactions(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );
  rawData.transactions = getExpiryDates(rawData.transactions, 90, false);

  let transactions = [];
  if (fromDays > 0) {
    transactions = rawData.transactions.filter(
      (transaction) => transaction.remainingDays >= fromDays && transaction.remainingDays <= toDays,
    );
  } else {
    transactions = rawData.transactions.filter(
      (transaction) => transaction.remainingDays <= toDays,
    );
  }

  // default order from getExpiryDates is asc
  if (transactions.length > 0 && req.query && req.query.sort && req.query.sort === 'desc') {
    transactions.sort((a, b) => parseFloat(b.remainingDays) - parseFloat(a.remainingDays));
    sortOrder.queryString = `${req.params.page}?fromDays=${fromDays}&toDays=${toDays}`;
    sortOrder.order = 'descending';
    sortOrder.image = 'twistie-down';
  }

  const count = transactions.length;

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('reports/unissued-transactions-report.njk', {
    pages,
    transactions,
    primaryNav,
    banks,
    filter: {
      ...submissionFilters,
    },
    sortOrder,
    subNav: 'unissued-transactions-report',
    user: req.session.user,
  });
});
=======
router.use('/', miaToBeSubmittedWithConditions);
router.use('/', miaToBeSubmittedWithoutConditions);
router.use('/', auditSupplyContracts);
router.use('/', auditTransactions);
router.use('/', unissuedTransactions);
router.use('/', countdownIndicator);
router.use('/', reconciliation);
router.use('/', transactions);
router.use('/', transactionReport);
router.use('/', miaMinCoverStartDateChanges);
>>>>>>> split reports into different files

>>>>>>> Add filters to countdown indicator reports:portal/server/routes/reports/index.js
export default router;
