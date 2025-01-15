const express = require('express');
const { ROLES, validateFeeRecordCorrectionFeatureFlagIsEnabled } = require('@ukef/dtfs2-common');
const {
  getProvideUtilisationReportCorrection,
  postProvideUtilisationReportCorrection,
  getUtilisationReportCorrectionReview,
  postUtilisationReportCorrectionReview,
  getRecordCorrectionSent,
  cancelUtilisationReportCorrection,
} = require('../../../controllers/utilisation-report-service/record-correction');
const { validateRole, validateToken, validateSqlId } = require('../../middleware');

const router = express.Router();

router
  .route('/utilisation-reports/provide-correction/:correctionId')
  .all([validateFeeRecordCorrectionFeatureFlagIsEnabled, validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })], validateSqlId('correctionId'))
  .get((req, res) => getProvideUtilisationReportCorrection(req, res))
  .post((req, res) => postProvideUtilisationReportCorrection(req, res));

router.get(
  '/utilisation-reports/provide-correction/:correctionId/check-the-information',
  [validateFeeRecordCorrectionFeatureFlagIsEnabled, validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })],
  validateSqlId('correctionId'),
  (req, res) => getUtilisationReportCorrectionReview(req, res),
);

router.post(
  '/utilisation-reports/cancel-correction/:correctionId',
  [validateFeeRecordCorrectionFeatureFlagIsEnabled, validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })],
  validateSqlId('correctionId'),
  (req, res) => cancelUtilisationReportCorrection(req, res),
);

router.get(
  '/utilisation-reports/correction-sent',
  [validateFeeRecordCorrectionFeatureFlagIsEnabled, validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })],
  (req, res) => getRecordCorrectionSent(req, res),
);

router
  .route('/utilisation-reports/provide-correction/:correctionId/check-the-information')
  .all(validateFeeRecordCorrectionFeatureFlagIsEnabled, validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] }))
  .post((req, res) => postUtilisationReportCorrectionReview(req, res));

module.exports = router;
