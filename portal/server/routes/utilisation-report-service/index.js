const express = require('express');

const utilisationReportDownloadRoutes = require('./utilisation-report-download');
const utilisationReportUploadRoutes = require('./utilisation-report-upload');
const previousReportsRoutes = require('./previous-reports');

const router = express.Router();

router.use('/', utilisationReportDownloadRoutes);
router.use('/', utilisationReportUploadRoutes);
router.use('/', previousReportsRoutes);

module.exports = router;
