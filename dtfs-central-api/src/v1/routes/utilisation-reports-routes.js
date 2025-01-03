const express = require('express');
const validation = require('../validation/route-validators/route-validators');
const handleExpressValidatorResult = require('../validation/route-validators/express-validator-result-handler');
const {
  validatePostPaymentPayload,
  validateDeletePaymentPayload,
  validatePatchPaymentPayload,
  validatePostKeyingDataPayload,
  validatePutKeyingDataMarkAsPayload,
  validatePostRemoveFeesFromPaymentGroupPayload,
  validatePostReportDataValidationPayload,
  validatePostAddFeesToAnExistingPaymentGroupPayload,
  validatePostUploadUtilisationReportPayload,
  validatePostFeeRecordCorrectionPayload,
  validatePutFeeRecordCorrectionTransientFormDataPayload,
} = require('./middleware/payload-validation');
const { getUtilisationReportById } = require('../controllers/utilisation-report-service/get-utilisation-report.controller');
const { postUploadUtilisationReport } = require('../controllers/utilisation-report-service/post-upload-utilisation-report.controller');
const {
  getUtilisationReportsReconciliationSummary,
} = require('../controllers/utilisation-report-service/get-utilisation-reports-reconciliation-summary.controller');
const putUtilisationReportStatusController = require('../controllers/utilisation-report-service/put-utilisation-report-status.controller');
const {
  getUtilisationReportReconciliationDetailsById,
} = require('../controllers/utilisation-report-service/get-utilisation-report-reconciliation-details-by-id.controller');
const { getSelectedFeeRecordDetails } = require('../controllers/utilisation-report-service/get-selected-fee-records-details.controller');
const { postPayment } = require('../controllers/utilisation-report-service/post-payment.controller');
const { deletePayment } = require('../controllers/utilisation-report-service/delete-payment.controller');
const { postKeyingData } = require('../controllers/utilisation-report-service/post-keying-data.controller');
const { getFeeRecordsToKey } = require('../controllers/utilisation-report-service/get-fee-records-to-key.controller');
const { getPaymentDetailsById } = require('../controllers/utilisation-report-service/get-payment-details-by-id.controller');
const { patchPayment } = require('../controllers/utilisation-report-service/patch-payment.controller');
const { putKeyingDataMarkAsDone } = require('../controllers/utilisation-report-service/put-keying-data-mark-as-done.controller');
const { putKeyingDataMarkAsToDo } = require('../controllers/utilisation-report-service/put-keying-data-mark-as-to-do.controller');
const { postRemoveFeesFromPaymentGroup } = require('../controllers/utilisation-report-service/post-remove-fees-from-payment-group.controller');
const { postReportDataValidation } = require('../controllers/utilisation-report-service/post-report-data-validation.controller');
const { postAddFeesToAnExistingPaymentGroup } = require('../controllers/utilisation-report-service/post-add-fees-to-an-existing-payment-group.controller');
const { getFeeRecord } = require('../controllers/utilisation-report-service/get-fee-record.controller');
const {
  getFeeRecordCorrectionRequestReview,
} = require('../controllers/utilisation-report-service/fee-record-correction/get-fee-record-correction-request-review.controller');
const {
  putFeeRecordCorrectionTransientFormData,
} = require('../controllers/utilisation-report-service/fee-record-correction/put-fee-record-correction-transient-form-data.controller');
const {
  getFeeRecordCorrectionTransientFormData,
} = require('../controllers/utilisation-report-service/fee-record-correction/get-fee-record-correction-transient-form-data.controller');
const { postFeeRecordCorrection } = require('../controllers/utilisation-report-service/fee-record-correction/post-fee-record-correction.controller');
const {
  deleteFeeRecordCorrectionTransientFormData,
} = require('../controllers/utilisation-report-service/fee-record-correction/delete-fee-record-correction-transient-form-data.controller');

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
utilisationReportsRouter.route('/').post(validatePostUploadUtilisationReportPayload, postUploadUtilisationReport);

/**
 * @openapi
 * /utilisation-reports/report-data-validation:
 *   post:
 *     summary: Validate utilisation report data
 *     tags: [Utilisation Report]
 *     description: Validate utilisation report data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reportData:
 *                 $ref: '#/definitions/RawReportDataWithCellLocations'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties:
 *                     csvValidationErrors:
 *                       type: array
 *                       items:
 *                         $ref: '#/definitions/CsvValidationError'
 *       500:
 *         description: Internal server error
 *       400:
 *         description: Invalid payload
 */
utilisationReportsRouter.route('/report-data-validation').post(validatePostReportDataValidationPayload, postReportDataValidation);

/**
 * @openapi
 * /utilisation-reports/report-data-validation:
 *   post:
 *     summary: Validate utilisation report data
 *     tags: [Utilisation Report]
 *     description: Validate utilisation report data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reportData:
 *                 $ref: '#/definitions/RawReportDataWithCellLocations'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties:
 *                     csvValidationErrors:
 *                       type: array
 *                       items:
 *                         $ref: '#/definitions/CsvValidationError'
 *       500:
 *         description: Internal server error
 *       400:
 *         description: Invalid payload
 */
utilisationReportsRouter.route('/report-data-validation').post(validatePostReportDataValidationPayload, postReportDataValidation);

/**
 * @openapi
 * /utilisation-reports/:id:
 *   get:
 *     summary: Get utilisation report with the specified id ('id')
 *     tags: [Utilisation Report]
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
 *     tags: [Utilisation Report]
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
 *     tags: [Utilisation Report]
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
 *     tags: [Utilisation Report]
 *     description: Gets the reconciliation details for the utilisation report by the report id
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the report to get the fee records for
 *       - in: query
 *         name: premiumPaymentsFilters
 *         schema:
 *           type: object
 *           $ref: '#/definitions/PremiumPaymentsFilters'
 *       - in: query
 *         name: paymentDetailsFilters
 *         schema:
 *           type: object
 *           $ref: '#/definitions/PaymentDetailsFilters'
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
 *     tags: [Utilisation Report]
 *     description: Get the fee record details for the selected fee record ids
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the report the fees belong to
 *       - in: query
 *         name: includeAvailablePaymentGroups
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           required: false
 *         description: Whether or not to include the available payment groups in the response body
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *               oneOf:
 *                 - $ref: '#/definitions/SelectedFeeRecordsDetailsWithAvailablePaymentGroupsResponseBody'
 *                 - $ref: '#/definitions/SelectedFeeRecordsDetailsWithoutAvailablePaymentGroupsResponseBody'
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

/**
 * @openapi
 * /utilisation-reports/:reportId/payment:
 *   post:
 *     summary: Add a payment to the utilisation report
 *     tags: [Utilisation Report]
 *     description: Adds a new payment to the utilisation report with the supplied report id
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the report to add the payment to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feeRecordIds:
 *                 description: The ids of the selected fee records
 *                 type: array
 *                 items:
 *                   type: number
 *               user:
 *                 $ref: '#/definitions/TFMUser'
 *               paymentCurrency:
 *                 $ref: '#/definitions/Currency'
 *               paymentAmount:
 *                 type: number
 *               datePaymentReceived:
 *                 type: string
 *                 description: the date the payment was received as an ISO date string
 *               paymentReference:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
utilisationReportsRouter
  .route('/:reportId/payment')
  .post(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, validatePostPaymentPayload, postPayment);

/**
 * @openapi
 * /utilisation-reports/:reportId/keying-data:
 *   post:
 *     summary: Generate keying data for a utilisation report
 *     tags: [Utilisation Report]
 *     description: Generates keying data for the utilisation report with the supplied report id
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the report to generate keying data for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 $ref: '#/definitions/TFMUser'
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
utilisationReportsRouter
  .route('/:reportId/keying-data')
  .post(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, validatePostKeyingDataPayload, postKeyingData);

/**
 * @openapi
 * /utilisation-reports/:reportId/fee-records-to-key:
 *   get:
 *     summary: Get the fee records to key for a utilisation report
 *     tags: [Utilisation Report]
 *     description: Gets the fee record to key for the utilisation report with the supplied id
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the report to get the fee records for
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/definitions/FeeRecordsToKeyResponseBody'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
utilisationReportsRouter.route('/:reportId/fee-records-to-key').get(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, getFeeRecordsToKey);

/**
 * @openapi
 * /utilisation-reports/:reportId/keying-data/mark-as-done:
 *   put:
 *     summary: Put keying sheet data status to DONE for multiple fee records
 *     tags: [Utilisation Report]
 *     description: Mark multiple fee records within a keying sheet as keying sheet row status DONE
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feeRecordIds:
 *                 type: array
 *                 items:
 *                   type: number
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
  .route('/:reportId/keying-data/mark-as-done')
  .put(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, validatePutKeyingDataMarkAsPayload, putKeyingDataMarkAsDone);

/**
 * @openapi
 * /utilisation-reports/:reportId/keying-data/mark-as-to-do:
 *   put:
 *     summary: Put keying sheet data status to TO DO for multiple fee records
 *     tags: [Utilisation Report]
 *     description: Mark multiple fee records within a keying sheet as keying sheet row status TO DO
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feeRecordIds:
 *                 type: array
 *                 items:
 *                   type: number
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
  .route('/:reportId/keying-data/mark-as-to-do')
  .put(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, validatePutKeyingDataMarkAsPayload, putKeyingDataMarkAsToDo);

/**
 * @openapi
 * /utilisation-reports/:reportId/payment/:paymentId:
 *   get:
 *     summary: Get the payment details
 *     tags: [Utilisation Report]
 *     description: Gets the payment details for the payment with the supplied id
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the report
 *       - in: path
 *         name: paymentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the payment
 *       - in: query
 *         name: includeFeeRecords
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           required: false
 *         description: Whether or not to include the fee records and total reported payments in the response body
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/definitions/PaymentDetailsWithFeeRecordsResponseBody'
 *                 - $ref: '#/definitions/PaymentDetailsWithoutFeeRecordsResponseBody'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 *   delete:
 *     summary: Delete a payment
 *     tags: [Utilisation Report]
 *     description: Deletes a payment
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the report the payment belongs to
 *       - in: path
 *         name: paymentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the payment to delete
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 *   patch:
 *     summary: Edit the payment
 *     tags: [Utilisation Report]
 *     description: Edits the payment with the supplied id
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the report
 *       - in: path
 *         name: paymentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentAmount:
 *                 type: number
 *               datePaymentReceived:
 *                 type: string
 *                 format: date
 *               paymentReference:
 *                 type: string
 *                 required: false
 *               user:
 *                 $ref: '#/definitions/TFMUser'
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
utilisationReportsRouter
  .route('/:reportId/payment/:paymentId')
  .all(validation.sqlIdValidation('reportId'), validation.sqlIdValidation('paymentId'), handleExpressValidatorResult)
  .get(getPaymentDetailsById)
  .delete(validateDeletePaymentPayload, deletePayment)
  .patch(validatePatchPaymentPayload, patchPayment);

/**
 * @openapi
 * /utilisation-reports/:reportId/payment/:paymentId/remove-selected-fees:
 *   post:
 *     summary: Remove the selected fee record ids
 *     tags: [Utilisation Report]
 *     description: Remove the selected fee record ids from the specified payment id
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the report
 *       - in: path
 *         name: paymentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feeRecordIds:
 *                 description: The ids of the selected fee records
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
utilisationReportsRouter
  .route('/:reportId/payment/:paymentId/remove-selected-fees')
  .post(
    validation.sqlIdValidation('reportId'),
    validation.sqlIdValidation('paymentId'),
    handleExpressValidatorResult,
    validatePostRemoveFeesFromPaymentGroupPayload,
    postRemoveFeesFromPaymentGroup,
  );

/**
 * @openapi
 * /utilisation-reports/:reportId/add-to-an-existing-payment:
 *   post:
 *     summary: Add the provided fee record ids to the provided payment ids
 *     tags: [Utilisation Report]
 *     description: Add the provided fee record ids to the provided payment ids
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the report
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feeRecordIds:
 *                 description: The ids of the selected fee records
 *                 type: array
 *                 items:
 *                   type: number
 *               paymentIds:
 *                 description: The ids of the payments
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
utilisationReportsRouter
  .route('/:reportId/add-to-an-existing-payment')
  .post(
    validation.sqlIdValidation('reportId'),
    handleExpressValidatorResult,
    validatePostAddFeesToAnExistingPaymentGroupPayload,
    postAddFeesToAnExistingPaymentGroup,
  );

/**
 * @openapi
 * /utilisation-reports/:reportId/fee-records/:feeRecordId:
 *   get:
 *     summary: Get the fee record
 *     tags: [Utilisation Report]
 *     description: Gets a fee record by its id, where that fee record must belong to a report with the supplied report id
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the report
 *       - in: path
 *         name: feeRecordId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the fee record
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/definitions/FeeRecordResponse'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
utilisationReportsRouter
  .route('/:reportId/fee-records/:feeRecordId')
  .all(validation.sqlIdValidation('reportId'), validation.sqlIdValidation('feeRecordId'), handleExpressValidatorResult)
  .get(getFeeRecord);

/**
 * @openapi
 * /utilisation-reports/:reportId/fee-records/:feeRecordId/correction-transient-form-data:
 *   put:
 *     summary: Save fee record correction transient form data against a user and fee record
 *     tags: [Utilisation Report]
 *     description: Save fee record correction transient form data against a user and fee record
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the report
 *       - in: path
 *         name: feeRecordId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the fee record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               formData:
 *                 type: object
 *                 $ref: '#/definitions/FeeRecordCorrectionTransientFormData'
 *               user:
 *                 type: object
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
  .route('/:reportId/fee-records/:feeRecordId/correction-transient-form-data')
  .all(validation.sqlIdValidation('reportId'), validation.sqlIdValidation('feeRecordId'), handleExpressValidatorResult)
  .put(validatePutFeeRecordCorrectionTransientFormDataPayload, putFeeRecordCorrectionTransientFormData);

/**
 * @openapi
 * /utilisation-reports/:reportId/fee-records/:feeRecordId/correction-transient-form-data/:userId:
 *   get:
 *     summary: Gets the fee record correction transient form data against a user and fee record
 *     tags: [Utilisation Report]
 *     description: Gets the fee record correction transient form data against a user and fee record
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the report
 *       - in: path
 *         name: feeRecordId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the fee record
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the user
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   $ref: '#/definitions/FeeRecordCorrectionTransientFormDataResponse'
 *                 - type: object
 *                   properties: {}
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 *   delete:
 *     summary: Deletes the fee record correction transient form data stored against a user and fee record
 *     tags: [Utilisation Report]
 *     description: Deletes the fee record correction transient form data stored against a user and fee record
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the report
 *       - in: path
 *         name: feeRecordId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the fee record
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the user
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
utilisationReportsRouter
  .route('/:reportId/fee-records/:feeRecordId/correction-transient-form-data/:userId')
  .all(validation.sqlIdValidation('reportId'), validation.sqlIdValidation('feeRecordId'), validation.mongoIdValidation('userId'), handleExpressValidatorResult)
  .get(getFeeRecordCorrectionTransientFormData)
  .delete(deleteFeeRecordCorrectionTransientFormData);

/**
 * @openapi
 * /utilisation-reports/:reportId/fee-records/:feeRecordId/corrections:
 *   post:
 *     summary: Create a fee record correction
 *     tags: [Utilisation Report]
 *     description: Create a fee record correction
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the report
 *       - in: path
 *         name: feeRecordId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the fee record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 $ref: '#/definitions/TFMUser'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  emails:
 *                    type: array
 *                    items:
 *                      type: string
 *                      format: email
 *                      example: 'test-user@test.com'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
utilisationReportsRouter
  .route('/:reportId/fee-records/:feeRecordId/corrections')
  .all(validation.sqlIdValidation('reportId'), validation.sqlIdValidation('feeRecordId'), handleExpressValidatorResult)
  .post(validatePostFeeRecordCorrectionPayload, postFeeRecordCorrection);

/**
 * @openapi
 * /utilisation-reports/:reportId/fee-records/:feeRecordId/correction-request-review/:userId:
 *   get:
 *     summary: Get correction request review information to check before sending
 *     tags: [Utilisation Report]
 *     description: Get correction request review information to check before sending
 *     parameters:
 *       - in: path
 *         name: reportId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the report
 *       - in: path
 *         name: feeRecordId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the fee record
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the user requesting the correction
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/definitions/FeeRecordCorrectionRequestReview'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
utilisationReportsRouter
  .route('/:reportId/fee-records/:feeRecordId/correction-request-review/:userId')
  .all(validation.sqlIdValidation('reportId'), validation.sqlIdValidation('feeRecordId'), validation.mongoIdValidation('userId'), handleExpressValidatorResult)
  .get(getFeeRecordCorrectionRequestReview);

module.exports = utilisationReportsRouter;
