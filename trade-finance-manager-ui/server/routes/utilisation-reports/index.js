const express = require('express');
const { getUtilisationReports, getUtilisationReportByBankId } = require('../../controllers/utilisation-reports');
const { getReportDownload } = require('../../controllers/utilisation-reports/report-download');
const { validateMongoId, validateUserTeam, validateBankId } = require('../../middleware');
const { PDC_TEAM_IDS } = require('../../constants');

const router = express.Router();

router.get('/', validateUserTeam(Object.values(PDC_TEAM_IDS)), getUtilisationReports);

router.get('/:_id/download', validateUserTeam(Object.values(PDC_TEAM_IDS)), validateMongoId, getReportDownload);

router.get(
  '/bank/:bankId',
  validateUserTeam(Object.values(PDC_TEAM_IDS)),
  validateBankId,
  getUtilisationReportByBankId,
);

module.exports = router;
