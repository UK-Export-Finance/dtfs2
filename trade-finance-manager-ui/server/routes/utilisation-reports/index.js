const express = require('express');
const { getUtilisationReports } = require('../../controllers/utilisation-reports');
const { validateMongoId, validateUserTeam } = require('../../middleware');
const { PDC_TEAM_IDS } = require('../../constants');
const { getReportDownload } = require('../../controllers/utilisation-reports/report-download');

const router = express.Router();

router.get('/', validateUserTeam(Object.values(PDC_TEAM_IDS)), getUtilisationReports);

router.get('/:_id/download', validateUserTeam(Object.values(PDC_TEAM_IDS)), validateMongoId, getReportDownload);

module.exports = router;
