const express = require('express');
const auditSupplyContracts = require('./audit-supply-contracts');
const auditTransactions = require('./audit-transactions');
const countdownIndicator = require('./countdown-indicator');
const miaMinCoverStartDateChanges = require('./mia_min-cover-start-date-changes');
const miaToBeSubmittedWithConditions = require('./mia-to-be-submitted-with-conditions');
const miaToBeSubmittedWithoutConditions = require('./mia-to-be-submitted-without-conditions');
const reconciliation = require('./reconciliation');
const transactionsReport = require('./transactions-report');
const transactions = require('./transactions');
const unissuedTransactions = require('./unissued-transactions');
const validateToken = require('../middleware/validate-token');

const router = express.Router();

router.use('/reports/*', validateToken);

// Default redirect until we put in a nav.
router.get('/reports', async (req, res) => {
  const test = 1;
  return res.render('reports/reports.njk', {
    test,
    primaryNav: 'reports',
    user: req.session.user,
  });
});

router.use('/', auditSupplyContracts);
router.use('/', auditTransactions);
router.use('/', countdownIndicator);
router.use('/', miaMinCoverStartDateChanges);
router.use('/', miaToBeSubmittedWithConditions);
router.use('/', miaToBeSubmittedWithoutConditions);
router.use('/', reconciliation);
router.use('/', transactionsReport);
router.use('/', transactions);
router.use('/', unissuedTransactions);

module.exports = router;
