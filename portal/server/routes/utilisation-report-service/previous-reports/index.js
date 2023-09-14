const express = require('express');
const { getUtilisationReportDownload } = require('../../../controllers/utilisation-report-service');
const { validateRole, validateToken } = require('../../middleware');

const router = express.Router();

// TODO FN-980 update role to payment officer
router.get('/', [validateToken, validateRole({ role: ['maker'] })], (req, res) => getUtilisationReportDownload(req, res));

module.exports = router;
