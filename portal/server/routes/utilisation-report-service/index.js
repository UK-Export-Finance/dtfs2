const express = require('express');

const utilisationReportUploadRoutes = require('./utilisation-report-upload');

const router = express.Router();

router.use('/', utilisationReportUploadRoutes);

module.exports = router;
