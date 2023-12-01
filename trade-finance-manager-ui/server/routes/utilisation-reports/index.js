const express = require('express');
const { getUtilisationReports } = require('../../controllers/utilisation-reports');

const router = express.Router();

router.get('/', getUtilisationReports);

module.exports = router;
