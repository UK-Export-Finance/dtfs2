import express from 'express';
import buyerPage from './buyerPage';
import companiesHouseSearch from './companiesHouseSearch';
import financialPage from './financialPage';
import previewPage from './previewPage';
import supplierPage from './supplierPage';
import { provide, DEAL } from '../../api-data-provider';

const router = express.Router();

router.use('/contract/:_id/about', provide([DEAL]));
router.use(supplierPage);
router.use(companiesHouseSearch);
router.use(buyerPage);
router.use(financialPage);
router.use(previewPage);

export default router;
