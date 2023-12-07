const express = require('express');
const { getUtilisationReports } = require('../../controllers/utilisation-reports');
const { validateUserTeam } = require('../../middleware');
const { PDC_TEAM_IDS } = require('../../constants');

const router = express.Router();

router.get('/', validateUserTeam(Object.values(PDC_TEAM_IDS)), getUtilisationReports);

module.exports = router;
