const express = require('express');
const validation = require('../validation/route-validators/route-validators');
const handleExpressValidatorResult = require('../validation/route-validators/express-validator-result-handler');
const {
  getUtilisationReportsReconciliationSummary,
} = require('../controllers/utilisation-report-service/get-utilisation-reports-reconciliation-summary.controller');

const utilisationReportsRouter = express.Router();

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
 *                     example: example: 2021-01-01T00:00:00.000Z
 *                   totalFacilitiesReported:
 *                     type: number
 *                   facilitiesLeftToReconcile:
 *                     type: number
 *       500:
 *         description: Internal Server Error
 */
utilisationReportsRouter
  .route('/reconciliation-summary/:submissionMonth')
  .get(validation.isoMonthValidation('submissionMonth'), handleExpressValidatorResult, getUtilisationReportsReconciliationSummary);

module.exports = utilisationReportsRouter;
