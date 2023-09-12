const express = require('express');
const { getUtilisationReportDownload } = require('../../../controllers/utilisation-report-service');

const router = express.Router();

//TODO FN-980 add validation here
router.get('/', (req, res) => getUtilisationReportDownload(req, res));

module.exports = router;