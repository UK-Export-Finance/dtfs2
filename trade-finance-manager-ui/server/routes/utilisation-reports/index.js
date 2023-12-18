const express = require('express');
const { getUtilisationReports } = require('../../controllers/utilisation-reports');
const { updateUtilisationReportStatus } = require('../../controllers/utilisation-reports/update-utilisation-report-status');
const { getReportDownload } = require('../../controllers/utilisation-reports/report-download');
const { getUtilisationReportByBankId } = require('../../controllers/utilisation-reports/utilisation-report-for-bank');
const { validateMongoId, validateUserTeam, validateBankId, validateParamIsIsoMonth } = require('../../middleware');
const { PDC_TEAM_IDS } = require('../../constants');

const router = express.Router();

router.get('/', validateUserTeam(Object.values(PDC_TEAM_IDS)), getUtilisationReports);

router.post('/', validateUserTeam([PDC_TEAM_IDS.PDC_RECONCILE]), updateUtilisationReportStatus);

router.get('/:_id/download', validateUserTeam(Object.values(PDC_TEAM_IDS)), validateMongoId, getReportDownload);

router.get(
  '/:submissionMonth/bank/:bankId',
  validateUserTeam(Object.values(PDC_TEAM_IDS)),
  validateParamIsIsoMonth('submissionMonth'),
  validateBankId,
  getUtilisationReportByBankId,
);

module.exports = router;
