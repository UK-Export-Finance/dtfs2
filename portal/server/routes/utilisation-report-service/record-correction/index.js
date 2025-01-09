const express = require('express');
const { ROLES, validateFeeRecordCorrectionFeatureFlagIsEnabled } = require('@ukef/dtfs2-common');
const { getProvideUtilisationReportCorrection, getRecordCorrectionInformation } = require('../../../controllers/utilisation-report-service/record-correction');
const { validateRole, validateToken, validateSqlId } = require('../../middleware');

const router = express.Router();

router.get(
  '/utilisation-reports/provide-correction/:correctionId',
  [validateFeeRecordCorrectionFeatureFlagIsEnabled, validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })],
  validateSqlId('correctionId'),
  (req, res) => getProvideUtilisationReportCorrection(req, res),
);

router.get(
  '/utilisation-reports/provide-correction/:correctionId/check-the-information',
  [validateFeeRecordCorrectionFeatureFlagIsEnabled, validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })],
  validateSqlId('correctionId'),
  (req, res) => getRecordCorrectionInformation(req, res),
);

module.exports = router;
