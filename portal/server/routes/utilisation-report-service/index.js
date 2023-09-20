const express = require('express');

const utilisationReportUploadRoutes = require('./utilisation-report-upload');
const previousReportsRoutes = require('./previous-reports');

const router = express.Router();

router.use('/', utilisationReportUploadRoutes);
router.use('/', previousReportsRoutes);

module.exports = router;
