const express = require('express');
const validation = require('../validation/route-validators/route-validators');
const handleExpressValidatorResult = require('../validation/route-validators/express-validator-result-handler');
const { getUtilisationReportById } = require('../controllers/utilisation-report-service/get-utilisation-report.controller');
const { postUtilisationReportData } = require('../controllers/utilisation-report-service/upload-utilisation-report.controller');
const {
  getUtilisationReportsReconciliationSummary,
} = require('../controllers/utilisation-report-service/get-utilisation-reports-reconciliation-summary.controller');
const putUtilisationReportStatusController = require('../controllers/utilisation-report-service/put-utilisation-report-status.controller');
const { mongoIdValidation } = require('../validation/route-validators/route-validators');

const utilisationReportsRouter = express.Router();

/**
 * @openapi
 * /utilisation-reports:
 *   post:
 *     summary: Save utilisation report data
 *     tags: [Portal - Utilisation Report Service]
 *     description: Save utilisation report data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties:
 *                     dateUploaded:
 *                       example: 2023-10-27T08:07:40.028Z
 *       500:
 *         description: Internal server error
 *       400:
 *         description: Invalid payload
 *       409:
 *         description: Server conflict
 */
utilisationReportsRouter.route('/').post(postUtilisationReportData);

/**
 * @openapi
 * /utilisation-reports/:_id:
 *   get:
 *     summary: Get utilisation report with the specified MongoDB ID ('_id')
 *     tags: [UtilisationReport]
 *     description: Get utilisation report with the specified MongoDB ID ('_id')
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the MongoDB ID for the required report
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/UtilisationReport'
 *                 - type: object
 *                   properties:
 *                     _id:
 *                       example: 123456abc
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 */
utilisationReportsRouter.route('/:_id').get(mongoIdValidation, handleExpressValidatorResult, getUtilisationReportById);

/**
 * @openapi
 * /utilisation-reports/reconciliation-summary/:submissionMonth:
 *   get:
 *     summary: |
 *       Utilisation report reconciliation summary for the specified submission
 *       month
 *     tags: [UtilisationReport]
 *     description: |
 *       Get a summary of utilisation report reconciliation status for all banks
 *       in the specified report submission month
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 required:
 *                   - bank
 *                   - status
 *                 properties:
 *                   reportId:
 *                     type: string
 *                     description: |
 *                       The MongoDB '_id' of the associated report (if received)
 *                       from the 'utilisationReports' collection
 *                   bank:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   status:
 *                     $ref: '#/definitions/UtilisationReportReconciliationStatus'
 *                   dateUploaded:
 *                     type: string
 *                     example: 2021-01-01T00:00:00.000Z
 *                   totalFeesReported:
 *                     type: number
 *                   reportedFeesLeftToReconcile:
 *                     type: number
 *                   isPlaceholderReport:
 *                     type: boolean
 *                     description: Describes whether or not the report was uploaded by a portal user (true if no, false if yes)
 *       500:
 *         description: Internal Server Error
 */
utilisationReportsRouter
  .route('/reconciliation-summary/:submissionMonth')
  .get(validation.isoMonthValidation('submissionMonth'), handleExpressValidatorResult, getUtilisationReportsReconciliationSummary);

/**
 * @openapi
 * /utilisation-reports/set-status:
 *   put:
 *     summary: Put utilisation report status for multiple utilisation reports
 *     tags: [UtilisationReport]
 *     description: Set the status of many utilisation reports to completed or not completed.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reportsWithStatus:
 *                 type: array
 *                 items:
 *                   oneOf:
 *                     - $ref: '#/definitions/UtilisationReportStatusWithReportId'
 *                     - $ref: '#/definitions/UtilisationReportStatusWithBankId'
 *               user:
 *                 $ref: '#/definitions/TFMUser'
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 */
utilisationReportsRouter
  .route('/set-status')
  .put(
    putUtilisationReportStatusController.putUtilisationReportStatus,
  );

module.exports = utilisationReportsRouter;
