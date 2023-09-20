const express = require('express');

const utilisationReportUploadRoutes = require('./utilisation-report-upload');
const utilisationReportDownloadRoutes = require('./previous-reports');

const router = express.Router();

router.use('/', utilisationReportUploadRoutes);
router.use('/previous-reports', utilisationReportDownloadRoutes);

module.exports = router;
