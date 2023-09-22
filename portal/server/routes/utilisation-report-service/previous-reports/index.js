const express = require('express');
const { getPreviousReports } = require('../../../controllers/utilisation-report-service');
const { validateRole, validateToken } = require('../../middleware');

const router = express.Router();

router.get('/previous-reports', [validateToken, validateRole({ role: ['payment-officer'] })], (req, res) => getPreviousReports(req, res));

module.exports = router;
