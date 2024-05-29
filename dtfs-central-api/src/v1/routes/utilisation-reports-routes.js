const express = require('express');
const validation = require('../validation/route-validators/route-validators');
const handleExpressValidatorResult = require('../validation/route-validators/express-validator-result-handler');
const { validatePostAddPaymentPayload } = require('./middleware/payload-validation/validate-post-add-payment-payload');
const { getUtilisationReportById } = require('../controllers/utilisation-report-service/get-utilisation-report.controller');
const {
  postUploadUtilisationReport,
  postUploadUtilisationReportPayloadValidator,
} = require('../controllers/utilisation-report-service/post-upload-utilisation-report.controller');
const {
  getUtilisationReportsReconciliationSummary,
} = require('../controllers/utilisation-report-service/get-utilisation-reports-reconciliation-summary.controller');
const putUtilisationReportStatusController = require('../controllers/utilisation-report-service/put-utilisation-report-status.controller');
const {
  getUtilisationReportReconciliationDetailsById,
} = require('../controllers/utilisation-report-service/get-utilisation-report-reconciliation-details-by-id.controller');
const { getSelectedFeeRecordDetails } = require('../controllers/utilisation-report-service/get-selected-fee-records-details.controller');
const { postAddPayment } = require('../controllers/utilisation-report-service/post-add-payment.controller');

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
utilisationReportsRouter.route('/').post(postUploadUtilisationReportPayloadValidator, postUploadUtilisationReport);

/**
 * @openapi
 * /utilisation-reports/:id:
 *   get:
 *     summary: Get utilisation report with the specified id ('id')
 *     tags: [UtilisationReport]
 *     description: Get utilisation report with the specified id ('id')
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the required report
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
 *                     id:
 *                       example: 5
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 */
utilisationReportsRouter.route('/:id').get(validation.sqlIdValidation('id'), handleExpressValidatorResult, getUtilisationReportById);

/**
 * @openapi
 * /utilisation-reports/reconciliation-summary/:submissionMonth:
 *   get:
 *     summary: |
 *       Utilisation report reconciliation summary for the specified submission
 *       month. This includes status of reports for all banks in the current
 *       submission month, and details of any open reports from previous
 *       submission months
 *     tags: [UtilisationReport]
 *     description: |
 *       Get a summary of utilisation report reconciliation status for all banks
 *       in the specified report submission month, and open reports from
 *       previous submission months
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/UtilisationReportReportPeriodReconciliationSummary'
 *       400:
 *         description: Bad request
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
 *                   $ref: '#/definitions/UtilisationReportStatusWithReportId'
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
utilisationReportsRouter.route('/set-status').put(putUtilisationReportStatusController.putUtilisationReportStatus);

/**
 * @openapi
 * /utilisation-reports/reconciliation-details/:reportId:
 *   get:
 *     summary: Get the reconciliation details for the utilisation report by the report id
 *     tags: [UtilisationReport]
 *     description: Gets the reconciliation details for the utilisation report by the report id
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/definitions/UtilisationReportReconciliationDetails'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not Found (if either the report with matching id or bank with matching id cannot be found)
 *       500:
 *         description: Internal Server Error
 */
utilisationReportsRouter
  .route('/reconciliation-details/:reportId')
  .get(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, getUtilisationReportReconciliationDetailsById);

/**
 * @openapi
 * /utilisation-reports/:id/selected-fee-records-details:
 *   get:
 *     summary: Get the fee record details for the selected fee record ids
 *     tags: [UtilisationReport]
 *     description: Get the fee record details for the selected fee record ids
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the report the fees belong to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *              properties:
 *               feeRecordIds:
 *                 description: The ids of the selected fee records
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/definitions/SelectedFeeRecordsDetails'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not Found (if the report with matching id cannot be found)
 *       500:
 *         description: Internal Server Error
 */
utilisationReportsRouter
  .route('/:id/selected-fee-records-details')
  .get(validation.sqlIdValidation('id'), handleExpressValidatorResult, getSelectedFeeRecordDetails);

utilisationReportsRouter
  .route('/:reportId/add-payment')
  .post(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, validatePostAddPaymentPayload, postAddPayment);

module.exports = utilisationReportsRouter;
