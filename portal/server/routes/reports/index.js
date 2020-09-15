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

export default router;
