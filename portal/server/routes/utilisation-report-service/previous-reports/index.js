const express = require('express');
const {
  ROLES: { PAYMENT_REPORT_OFFICER },
} = require('@ukef/dtfs2-common');
const { getPreviousReports } = require('../../../controllers/utilisation-report-service');
const { validateRole, validateToken } = require('../../middleware');

const router = express.Router();

router.get('/previous-reports', [validateToken, validateRole({ role: [PAYMENT_REPORT_OFFICER] })], (req, res) => getPreviousReports(req, res));

module.exports = router;
