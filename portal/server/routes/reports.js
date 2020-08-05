import express from 'express';
// import util from 'util';
import api from '../api';
import buildReportFilters from './buildReportFilters';
import CONSTANTS from '../constants';
import {
  getApiData,
  requestParams,
} from '../helpers';

const moment = require('moment');
require('moment-timezone');// monkey-patch to provide moment().tz()

function filterLocaliseTimestamp(utcTimestamp, targetTimezone) {
  const format = 'DD/MM/YYYY HH:mm';
  if (!utcTimestamp) {
    return '';
  }

  const utc = moment(parseInt(utcTimestamp, 10));
  const localisedTimestamp = utc.tz(targetTimezone);
  return localisedTimestamp.format(format);
}

const router = express.Router();
const PAGESIZE = 20;
const primaryNav = 'reports';

// Default redirect until we put in a nav.
router.get('/reports', async (req, res) => {
  const test = 1;
  return res.render('reports/reports.njk', {
    test,
    primaryNav,
    user: req.session.user,
  });
});

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
  // [dw] while mocking this report out, I don't think we really understand the data-model involved
  //  so I'm, just mocking this out the old way rather than trying to work out how to re-plumb the API.

  // const { userToken } = requestParams(req);
  // const { transactions, count } = await getApiData(
  //   api.transactions(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
  //   res,
  // );
  // const banks = await getApiData(api.banks(userToken), res);
  const crs = [
    {
      bankSupplyContractID: 'Memsstar/BSS/APG',
      bankFacilityId: 'Loan 3',
      transactionType: 'Loan',
      'supplier-name': 'TEST DO NOT TOUCH',
      oldRequestedCoverStartDate: '08/08/2018',
      newRequestedCoverStartDate: '18/08/2018',
      dateTimeOfChange: '08/08/2018 - 09:37',
      maker: 'DurgaRao',
      checker: {
        username: 'CHECKER',
        firstname: 'Emilio',
        surname: 'Largo',
      },
    },
  ];

  const count = crs.length; // in case people want to add more examples..

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('reports/mia_min-cover-start-date-changes.njk', {
    pages,
    crs,
    primaryNav,
    subNav: 'mia_min-cover-start-date-changes',
    user: req.session.user,
  });
});

router.get('/reports/reconciliation-report', async (req, res) => res.redirect('/reports/reconciliation-report/0'));

router.get('/reports/reconciliation-report/:page', async (req, res) => {
  // [dc] this is a copy of the mia_min-cover-start-date-changes mock for now.

  // const { userToken } = requestParams(req);
  // const { transactions, count } = await getApiData(
  //   api.transactions(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
  //   res,
  // );
  // const banks = await getApiData(api.banks(userToken), res);
  const crs = [
    {
      bankSupplyContractID: 'Memsstar/BSS/APG',
      bankFacilityId: 'Loan 3',
      transactionType: 'Loan',
      'supplier-name': 'TEST DO NOT TOUCH',
      oldRequestedCoverStartDate: '08/08/2018',
      newRequestedCoverStartDate: '18/08/2018',
      dateTimeOfChange: '08/08/2018 - 09:37',
      maker: 'DurgaRao',
      checker: {
        username: 'CHECKER',
        firstname: 'Emilio',
        surname: 'Largo',
      },
    },
  ];

  const count = crs.length; // in case people want to add more examples..

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('reports/reconciliation-report.njk', {
    pages,
    crs,
    primaryNav,
    subNav: 'reconciliation-report',
    user: req.session.user,
  });
});

router.get('/reports/countdown-indicator', async (req, res) => {
  // [dw] while mocking this report out, I don't think we really understand the data-model involved
  //  so I'm, just mocking this out the old way rather than trying to work out how to re-plumb the API.

  const issueOrMakeFirstAdvance = {
    caption: 'You have 3 months to issue or make first advance under a transaction.',
    firstCellIsHeader: true,
    head: [{ text: 'Days remaining' }, { text: 'Facilities' }],
    rows: [
      [{ text: '0 to 15' }, { html: '<strong class="govuk-tag govuk-tag--red">10</strong> &nbsp; <a href="TODO" >view</a>' }],
      [{ text: '16 to 45' }, { html: '<strong class="govuk-tag govuk-tag--orange">8</strong> &nbsp; <a href="TODO" >view</a>' }],
      [{ text: '46 to 90' }, { html: '<strong class="govuk-tag govuk-tag--green">5</strong> &nbsp; <a href="TODO" >view</a>' }],
    ],
  };

  const manualInclusionsWithConditions = {
    caption: 'Manual Inclusion Applications accepted by UKEF (with conditions)',
    firstCellIsHeader: true,
    head: [{ text: 'Days remaining' }, { text: 'Supply Contracts' }, { text: '' }],
    rows: [
      [{ text: '0 to 6' }, { html: '<strong class="govuk-tag govuk-tag--red">1</strong> &nbsp; <a href="TODO" >view</a>' }],
      [{ text: '7 to 13' }, { html: '<strong class="govuk-tag govuk-tag--orange">0</strong> &nbsp; <a href="TODO" >view</a>' }],
      [{ text: '14 to 20' }, { html: '<strong class="govuk-tag govuk-tag--green">0</strong> &nbsp; <a href="TODO" >view</a>' }],
    ],
  };

  const manualInclusionsWithoutConditions = {
    caption: 'Manual Inclusion Applications accepted by UKEF (without conditions)',
    firstCellIsHeader: true,
    head: [{ text: 'Days remaining' }, { text: 'Supply Contracts' }, { text: '' }],
    rows: [
      [{ text: '0 to 6' }, { html: '<strong class="govuk-tag govuk-tag--red">1</strong> &nbsp; <a href="TODO" >view</a>' }],
      [{ text: '7 to 13' }, { html: '<strong class="govuk-tag govuk-tag--orange">0</strong> &nbsp; <a href="TODO" >view</a>' }],
      [{ text: '14 to 20' }, { html: '<strong class="govuk-tag govuk-tag--green">0</strong> &nbsp; <a href="TODO" >view</a>' }],
    ],
  };

  const reportData = {
    issueOrMakeFirstAdvance,
    manualInclusionsWithConditions,
    manualInclusionsWithoutConditions,
  };

  return res.render('reports/countdown-indicator.njk', {
    reportData,
    primaryNav,
    subNav: 'countdown-indicator',
    user: req.session.user,
  });
});

// router.get('/reports/abandoned-supply-contracts',
//   async (req, res) => res.redirect('/reports/abandoned-supply-contracts/0'));

// router.get('/reports/abandoned-supply-contracts/:page', async (req, res) => {
//   const { userToken } = requestParams(req);

//   // only mocking; not trying to plumb data model
//   //  should really be sending filter/order-by queries to deal-api
//   const contracts = [
//     {
//       dealId: '1234', // not obvious which id. would say its from k2 but abandoned deals wouldn't have this..
// so _id??
//       details: {
//         bank: {
//           name: 'HSBC',
//         },
//         bankSupplyContractID: 'Memsstar/BSS/APG',
//         status: 'Abandoned Deal',
//         submissionType: 'Automatic Inclusion Notice',
//         maker: {
//           username: 'a maker',
//         },
//         dateOfCreation: '13/12/2018 - 12:23',
//         abandoned: '14/12/2018 - 12:23',
//       },
//     },
//   ];

//   const count = contracts.length; // in case people want to add more examples..

//   const pages = {
//     totalPages: Math.ceil(count / PAGESIZE),
//     currentPage: parseInt(req.params.page, 10),
//     totalItems: count,
//   };

//   const banks = await getApiData(
//     api.banks(userToken),
//     res,
//   );

//   return res.render('reports/abandoned-supply-contracts.njk', {
//     pages,
//     contracts,
//     banks,
//     primaryNav,
//     subNav: 'abandoned-supply-contracts',
//     user: req.session.user,
//   });
// });

// router.get('/reports/red-line-answers', async (req, res) => res.redirect('/reports/red-line-answers/0'));

// router.get('/reports/red-line-answers/:page', async (req, res) => {
//   // only mocking; not trying to plumb data model
//   //  should really be sending filter/order-by queries to deal-api
//   const deal1 = {
//     dealId: '1234', // not obvious which id. would say its from k2 but abandoned deals wouldn't have this.. so _id??
//     details: {
//       bank: {
//         name: 'HSBC',
//       },
//       bankSupplyContractID: 'Memsstar/BSS/APG',
//       status: 'Abandoned Deal',
//       submissionType: 'Automatic Inclusion Notice',
//       maker: {
//         username: 'maker1',
//       },
//       dateOfCreation: '13/12/2018 - 12:23',
//       abandoned: '14/12/2018 - 12:23',
//     },
//   };

//   const deal2 = {
//     dealId: '4321', // not obvious which id. would say its from k2 but abandoned deals wouldn't have this.. so _id??
//     details: {
//       bank: {
//         name: 'HSBC',
//       },
//       bankSupplyContractID: 'Memsstar/BSS/APG',
//       status: 'Abandoned Deal',
//       submissionType: 'Automatic Inclusion Notice',
//       maker: {
//         username: 'maker2',
//       },
//       dateOfCreation: '13/12/2018 - 12:23',
//       abandoned: '14/12/2018 - 12:23',
//     },
//   };

//   const mandatoryCriteria = [
//     {
//       _id: '123456789012',
//       dateOfCreation: '20/04/2020 - 14:40',
//       outcome: 'Passed',
//       question: '1. All of the above mandatory criteria are true for this supply contract.',
//       answer: true,
//       deal: deal1,
//     }, {
//       _id: '210987654321',
//       dateOfCreation: '20/04/2020 - 14:45',
//       outcome: 'Failed',
//       question: '1. All of the above mandatory criteria are true for this supply contract.',
//       answer: false,
//       deal: deal2,
//     },

//   ];
//   const count = mandatoryCriteria.length; // in case people want to add more examples..

//   const pages = {
//     totalPages: Math.ceil(count / PAGESIZE),
//     currentPage: parseInt(req.params.page, 10),
//     totalItems: count,
//   };

//   return res.render('reports/red-line-answers.njk', {
//     pages,
//     mandatoryCriteria,
//     primaryNav,
//     subNav: 'red-line-answers',
//     user: req.session.user,
//   });
// });

// router.get('/reports/audit-log-all-changes', async (req, res) => res.redirect('/reports/audit-log-all-changes/0'));

// router.get('/reports/audit-log-all-changes/:page', async (req, res) => {
//   // only mocking; not trying to plumb data model
//   //  should really be sending filter/order-by queries to deal-api
//   const changes = [{
//     no: '69297',
//     entityId: '18331',
//     entityType: 'webform_submission',
//     user: 'maker1@ukexportfinance.gov.uk',
//     created: '21/04/202 - 14:07',
//     doneTo: 'Bond',
//     changes: [
//       [{ text: 'Is the currency for this Bond the same as your Supply Contract currency?' },
//         { text: '' },
//         { text: 'yes' }],
//     ],
//   }, {
//     no: '69296',
//     entityId: '18331',
//     entityType: 'webform_submission',
//     user: 'maker1@ukexportfinance.gov.uk',
//     created: '21/04/202 - 14:06',
//     doneTo: 'Bond',
//     changes: [
//       [
//         { text: 'Risk Margin Fee %' },
//         { text: '' },
//         { text: '12' },
//       ], [
//         { text: 'Covered Percentage' },
//         { text: '' },
//         { text: '10' },
//       ], [
//         { text: 'Guarnetee fee payable by bank' },
//         { text: '0.0000' },
//         { text: '10.8000' },
//       ],
//     ],
//   }];

//   const count = changes.length; // in case people want to add more examples..

//   const pages = {
//     totalPages: Math.ceil(count / PAGESIZE),
//     currentPage: parseInt(req.params.page, 10),
//     totalItems: count,
//   };

//   return res.render('reports/audit-log-all-changes.njk', {
//     pages,
//     changes,
//     primaryNav,
//     subNav: 'audit-log-all-changes',
//     user: req.session.user,
//   });
// });

// router.get('/reports/audit-log-user-changes', async (req, res) => res.redirect('/reports/audit-log-user-changes/0'));

// router.get('/reports/audit-log-user-changes/:page', async (req, res) => {
//   // only mocking; not trying to plumb data model
//   //  should really be sending filter/order-by queries to deal-api
//   const changes = [{
//     no: '69295',
//     user: 'maker1@ukexportfinance.gov.uk',
//     created: '21/04/202 - 14:07',
//     doneTo: 'Some User (user@bank.com)',
//     changes: [
//       [{ text: 'Roles' },
//         { text: '' },
//         { text: 'ukef_operations' }],
//     ],
//   }, {
//     no: '69296',
//     user: 'maker1@ukexportfinance.gov.uk',
//     created: '21/04/202 - 14:06',
//     doneTo: 'Bond',
//     changes: [
//       [{ text: 'Roleds' },
//         { text: '' },
//         { text: 'cont' }],
//     ],
//   }];

//   const count = changes.length; // in case people want to add more examples..

//   const pages = {
//     totalPages: Math.ceil(count / PAGESIZE),
//     currentPage: parseInt(req.params.page, 10),
//     totalItems: count,
//   };

//   return res.render('reports/audit-log-user-changes.njk', {
//     pages,
//     changes,
//     primaryNav,
//     subNav: 'audit-log-user-changes',
//     user: req.session.user,
//   });
// });

// router.get('/reports/audit-log-webform-changes',
// async (req, res) => res.redirect('/reports/audit-log-webform-changes/0'));

// router.get('/reports/audit-log-webform-changes/:page', async (req, res) => {
//   // only mocking; not trying to plumb data model
//   //  should really be sending filter/order-by queries to deal-api
//   const changes = [{
//     no: '69295',
//     user: 'maker1@ukexportfinance.gov.uk',
//     created: '21/04/202 - 14:07',
//     doneTo: 'Confirm eligibility',
//     changes: [
//       [{ text: 'elements -> general_criteria -> ec_requested_cover_start_date -> #description' },
//         { text: 'The Requested Cover Start Date is no more than one month from the date of submission.' },
//         { text: 'The Requested Cover Start Date is no more than three months from the date of submission.' }],
//     ],
//   }, {
//     no: '69296',
//     user: 'maker1@ukexportfinance.gov.uk',
//     created: '21/04/202 - 14:06',
//     doneTo: 'Confirm eligibility',
//     changes: [
//       [{ text: 'elements -> general_criteria -> question_3 -> #description' },
//         { text: 'The total UKEF exposure for this Transaction and any prior live covered Transactions for this
// Obligor does not exceed &pound;2 million, or such other limit approved by UKEF (that has not lapsed or been
// withdrawn) in relation to this Obligor.' },
//         { text: 'The total UKEF exposure, across all short-term schemes (including bond support and export
// working capital transactions), for this Obligor (including this Transaction) does not exceed £2 million, or
// such other limit approved by UKEF (that has not lapsed or been withdrawn).' }],
//     ],
//   }];

//   const count = changes.length; // in case people want to add more examples..

//   const pages = {
//     totalPages: Math.ceil(count / PAGESIZE),
//     currentPage: parseInt(req.params.page, 10),
//     totalItems: count,
//   };

//   return res.render('reports/audit-log-webform-changes.njk', {
//     pages,
//     changes,
//     primaryNav,
//     subNav: 'audit-log-webform-changes',
//     user: req.session.user,
//   });
// });

export default router;
