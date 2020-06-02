import express from 'express';
import buyerPage from './buyerPage';
import companiesHouseSearch from './companiesHouseSearch';
import financialPage from './financialPage';
import previewPage from './previewPage';
import supplierPage from './supplierPage';

const router = express.Router();

router.use(supplierPage);
router.use(companiesHouseSearch);
router.use(buyerPage);
router.use(financialPage);
router.use(previewPage);

export default router;
