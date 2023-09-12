const express = require('express');

const utilisationReportDownloadRoutes = require('./previous-reports');

const router = express.Router();

router.use('/previous-reports', utilisationReportDownloadRoutes)

module.exports = router;