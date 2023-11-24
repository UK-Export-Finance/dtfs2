const express = require('express');
const { getUtilisationReports } = require('../../controllers/utilisation-reports');
const { validateUserTeam } = require('../../middleware');
const { TEAM_IDS } = require('../../constants');

const router = express.Router();

router.get('/', validateUserTeam([TEAM_IDS.PDC_READ, TEAM_IDS.PDC_RECONCILE]), getUtilisationReports);

module.exports = router;
