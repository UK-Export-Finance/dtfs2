const express = require('express');
const { ROLES, validateFeeRecordCorrectionFeatureFlagIsEnabled } = require('@ukef/dtfs2-common');
const {
  getProvideUtilisationReportCorrection,
  postProvideUtilisationReportCorrection,
  getUtilisationReportCorrectionReview,
  postUtilisationReportCorrectionReview,
  getRecordCorrectionSent,
  cancelUtilisationReportCorrection,
  getRecordCorrectionLog,
} = require('../../../controllers/utilisation-report-service/record-correction');
const { validateRole, validateToken, validateSqlId } = require('../../middleware');

const router = express.Router();

/**
 * @openapi
 * /utilisation-reports/provide-correction/:correctionId:
 *   get:
 *     summary: GET provide utilisation report correction route.
 *     tags: [Portal]
 *     description: GET provide utilisation report correction route.
 *     parameters:
 *       - in: path
 *         name: correctionId
 *         schema:
 *           type: string
 *         description: the correction ID
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: POST provide utilisation report correction route
 *     tags: [Portal]
 *     description: POST provide utilisation report correction route
 *     parameters:
 *       - in: path
 *         name: correctionId
 *         schema:
 *           type: string
 *         description: the correction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router
  .route('/utilisation-reports/provide-correction/:correctionId')
  .all([validateFeeRecordCorrectionFeatureFlagIsEnabled, validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })], validateSqlId('correctionId'))
  .get((req, res) => getProvideUtilisationReportCorrection(req, res))
  .post((req, res) => postProvideUtilisationReportCorrection(req, res));

/**
 * @openapi
 * /utilisation-reports/provide-correction/:correctionId/check-the-information:
 *   get:
 *     summary: GET "check the information" page for a utilisation report correction
 *     tags: [Portal]
 *     description: GET "check the information" page for a utilisation report correction
 *     parameters:
 *       - in: path
 *         name: correctionId
 *         schema:
 *           type: string
 *         description: the correction ID
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: POST for the utilisation report correction review page.
 *     tags: [Portal]
 *     description: POST for the utilisation report correction review page.
 *     parameters:
 *       - in: path
 *         name: correctionId
 *         schema:
 *           type: string
 *         description: the correction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router
  .route('/utilisation-reports/provide-correction/:correctionId/check-the-information')
  .all(validateFeeRecordCorrectionFeatureFlagIsEnabled, validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] }), validateSqlId('correctionId'))
  .get((req, res) => getUtilisationReportCorrectionReview(req, res))
  .post((req, res) => postUtilisationReportCorrectionReview(req, res));

/**
 * @openapi
 * /utilisation-reports/cancel-correction/:correctionId:
 *   post:
 *     summary: POST for the cancel correction route.
 *     tags: [Portal]
 *     description: POST for the cancel correction route.
 *     parameters:
 *       - in: path
 *         name: correctionId
 *         schema:
 *           type: string
 *         description: the correction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router.post(
  '/utilisation-reports/cancel-correction/:correctionId',
  [validateFeeRecordCorrectionFeatureFlagIsEnabled, validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })],
  validateSqlId('correctionId'),
  (req, res) => cancelUtilisationReportCorrection(req, res),
);

/**
 * @openapi
 * /utilisation-reports/correction-sent:
 *   get:
 *     summary: GET record correction sent route.
 *     tags: [Portal]
 *     description: GET record correction sent route.
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router.get(
  '/utilisation-reports/correction-sent',
  [validateFeeRecordCorrectionFeatureFlagIsEnabled, validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })],
  (req, res) => getRecordCorrectionSent(req, res),
);

/**
 * @openapi
 * /utilisation-reports/correction-log:
 *   get:
 *     summary: GET record correction sent route.
 *     tags: [Portal]
 *     description: GET record correction sent route.
 *     responses:
 *       200:
 *         description: Ok
 *       401:
 *         description: Unauthorised insertion
 *       500:
 *         description: Internal server error
 */
router.get(
  '/utilisation-reports/correction-log',
  [validateFeeRecordCorrectionFeatureFlagIsEnabled, validateToken, validateRole({ role: [ROLES.PAYMENT_REPORT_OFFICER] })],
  (req, res) => getRecordCorrectionLog(req, res),
);

module.exports = router;
