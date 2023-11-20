const express = require('express');
const bankReportsController = require('../../controllers/bank-reports');
const { validateUserTeam } = require('../../middleware');
const { TEAMS } = require('../../constants');

const router = express.Router();

router.get('/', validateToken, validateUserTeam([TEAMS.PDC_READ, TEAMS.PDC_RECONCILE]), bankReportsController.getBankReports);

module.exports = router;
