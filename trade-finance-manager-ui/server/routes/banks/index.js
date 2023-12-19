const express = require('express');
const { validateUserTeam } = require('../../middleware');
const { PDC_TEAM_IDS } = require('../../constants');
const { getReportDownload } = require('../../controllers/utilisation-reports/report-download');

const router = express.Router();

router.get('/:bankId/utilisation-report-download/:_id', validateUserTeam(Object.values(PDC_TEAM_IDS)), (req, res) => getReportDownload(req, res));

module.exports = router;
