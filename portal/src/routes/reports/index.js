import express from 'express';
import auditSupplyContracts from './audit-supply-contracts';
import auditTransactions from './audit-transactions';
import countdownIndicator from './countdown-indicator';
import miaMinCoverStartDateChanges from './mia_min-cover-start-date-changes';
import miaToBeSubmittedWithConditions from './mia-to-be-submitted-with-conditions';
import miaToBeSubmittedWithoutConditions from './mia-to-be-submitted-without-conditions';
import reconciliation from './reconciliation';
import transactionsReport from './transactions-report';
import transactions from './transactions';
import unissuedTransactions from './unissued-transactions';
import validateToken from '../middleware/validate-token';

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

export default router;
