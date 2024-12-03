const express = require('express');
const buyerPage = require('./buyerPage');
const companiesHouseSearch = require('./companiesHouseSearch');
const financialPage = require('./financialPage');
const previewPage = require('./previewPage');
const supplierPage = require('./supplierPage');
const { provide, DEAL } = require('../../api-data-provider');

const router = express.Router();

router.use('/contract/:_id/about', provide([DEAL]));
router.use(supplierPage);
router.use(companiesHouseSearch);
router.use(buyerPage);
router.use(financialPage);
router.use(previewPage);

module.exports = router;
