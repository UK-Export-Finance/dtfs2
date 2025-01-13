const express = require('express');
const { ROLES, validateFeeRecordCorrectionFeatureFlagIsEnabled } = require('@ukef/dtfs2-common');
const {
  getProvideUtilisationReportCorrection,
  postProvideUtilisationReportCorrection,
  getRecordCorrectionSent,
} = require('../../../controllers/utilisation-report-service/record-correction');
const { validateRole, validateToken, validateSqlId } = require('../../middleware');

const router = express.Router();

router
  .route('/utilisation-reports/provide-correction/:correctionId')
  .all([validateFeeRecordCorrectionFeatureFlagIsEnabled, validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })], validateSqlId('correctionId'))
  .get((req, res) => getProvideUtilisationReportCorrection(req, res))
  .post((req, res) => postProvideUtilisationReportCorrection(req, res));

router.get(
  '/utilisation-reports/correction-sent',
  [validateFeeRecordCorrectionFeatureFlagIsEnabled, validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })],
  (req, res) => getRecordCorrectionSent(req, res),
);

module.exports = router;
