const express = require('express');
const { getUtilisationReports } = require('../../controllers/utilisation-reports');
const { validateUserTeam } = require('../../middleware');
const { TEAMS } = require('../../constants');

const router = express.Router();

router.get('/', validateUserTeam([TEAMS.PDC_READ, TEAMS.PDC_RECONCILE]), getUtilisationReports);

module.exports = router;
