const express = require('express');
const { ROLES } = require('@ukef/dtfs2-common');
const { getProvideUtilisationReportCorrection, getRecordCorrectionInformation } = require('../../../controllers/utilisation-report-service/record-correction');
const { validateRole, validateToken, validateSqlId } = require('../../middleware');

const router = express.Router();

router.get(
  '/utilisation-reports/provide-correction/:correctionId',
  [validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })],
  validateSqlId('correctionId'),
  (req, res) => getProvideUtilisationReportCorrection(req, res),
);

// TODO: Add FF check to this route once FN-3668 (PR #4106), which adds the FF validation, is merged.
router.get(
  '/utilisation-reports/provide-correction/:correctionId/check-the-information',
  [validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })],
  validateSqlId('correctionId'),
  (req, res) => getRecordCorrectionInformation(req, res),
);

module.exports = router;
