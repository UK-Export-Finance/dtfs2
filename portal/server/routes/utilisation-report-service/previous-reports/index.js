const express = require('express');
const { getPreviousReports } = require('../../../controllers/utilisation-report-service');
const { validateRole, validateToken } = require('../../middleware');
const { ROLES: { PAYMENT_REPORT_OFFICER } } = require('../../../constants');

const router = express.Router();

router.get('/previous-reports', [validateToken, validateRole({ role: [PAYMENT_REPORT_OFFICER] })], (req, res) => getPreviousReports(req, res));

module.exports = router;
