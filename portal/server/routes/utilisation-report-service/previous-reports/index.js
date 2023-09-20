const express = require('express');
const { getPreviousReports } = require('../../../controllers/utilisation-report-service');
const { validateRole, validateToken } = require('../../middleware');

const router = express.Router();

// TODO FN-955 update role to payment officer
router.get('/previous-reports', [validateToken, validateRole({ role: ['maker'] })], (req, res) => getPreviousReports(req, res));

module.exports = router;
