const express = require('express');

const bankRouter = express.Router();

const getBankController = require('../controllers/bank/get-bank.controller');
const { getBanks } = require('../controllers/bank/get-banks.controller');
const createBankController = require('../controllers/bank/create-bank.controller');
const getNextReportPeriodController = require('../controllers/bank/get-next-report-period-by-bank.controller');
const { getUtilisationReportsByBankIdAndOptions } = require('../controllers/utilisation-report-service/get-utilisation-reports.controller');
const { validatePutFeeRecordCorrectionTransientFormDataPayload, validatePutFeeRecordCorrectionPayload } = require('./middleware/payload-validation');
const {
  putFeeRecordCorrectionTransientFormData,
} = require('../controllers/utilisation-report-service/fee-record-correction/put-fee-record-correction-transient-form-data.controller');
const { putFeeRecordCorrection } = require('../controllers/utilisation-report-service/fee-record-correction/put-fee-record-correction.controller');
const {
  getUtilisationReportPendingCorrectionsByBankId,
} = require('../controllers/utilisation-report-service/fee-record-correction/get-utilisation-report-pending-corrections.controller');
const {
  getUtilisationReportSummariesByBankIdAndYear,
} = require('../controllers/utilisation-report-service/get-utilisation-reports-reconciliation-summary.controller');
const {
  getCompletedFeeRecordCorrections,
} = require('../controllers/utilisation-report-service/fee-record-correction/get-completed-fee-record-corrections.controller');

const validation = require('../validation/route-validators/route-validators');
const handleExpressValidatorResult = require('../validation/route-validators/express-validator-result-handler');

/**
 * @openapi
 * /bank:
 *   get:
 *     summary: Get an array of all banks in the banks collection
 *     tags: [Bank]
 *     description: Get an array of all banks in the banks collection
 *     parameters:
 *       - in: query
 *         name: includeReportingYears
 *         schema:
 *           type: boolean
 *         description: Whether or not to include the years where a bank has submitted a utilisation report
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 oneOf:
 *                   - $ref: '#/definitions/Bank'
 *                   - $ref: '#/definitions/BankWithReportingYears'
 *   post:
 *     summary: Create a bank in banks collection
 *     tags: [Bank]
 *     description: Create a bank in banks collection
 *     requestBody:
 *       description: Fields required to create a bank. No validation in place.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/Bank'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: 123456abc
 */
bankRouter.route('/').get(getBanks).post(createBankController.createBankPost);

/**
 * @openapi
 * /bank/:id:
 *   get:
 *     summary: Get a bank by ID
 *     tags: [Bank]
 *     description: Get a bank by ID. Not MongoDB _id, but the bank ID provided when created.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Bank ID to get
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/Bank'
 *                 - type: object
 *                   properties:
 *                     _id:
 *                       example: 123456abc
 *       404:
 *         description: Not found
 */
bankRouter.route('/:bankId').get(validation.bankIdValidation, handleExpressValidatorResult, getBankController.findOneBankGet);

/**
 * @openapi
 * /bank/:bankId/utilisation-reports:
 *   get:
 *     summary: Get utilisation reports by bank ID
 *     tags: [Utilisation Report]
 *     description: Get a banks utilisation reports by ID.
 *     parameters:
 *       - in: path
 *         name: bankId
 *         schema:
 *           type: string
 *         required: true
 *         description: bank ID to fetch reports for
 *       - in: query
 *         name: reportPeriod
 *         schema:
 *           - $ref: '#/definitions/ReportPeriod'
 *       - in: query
 *         name: excludeNotReceived
 *         schema:
 *           type: string
 *           enum:
 *             - true
 *             - false
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/definitions/UtilisationReport'
 *                   - type: object
 *                     properties:
 *                       id:
 *                         example: 12345
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 */
bankRouter.route('/:bankId/utilisation-reports').get(validation.bankIdValidation, handleExpressValidatorResult, getUtilisationReportsByBankIdAndOptions);

/**
 * @openapi
 * /bank/:bankId/next-report-period:
 *   get:
 *     summary: Get utilisation reports by bank ID
 *     tags: [Utilisation Report]
 *     description: Get a banks utilisation reports by ID.
 *     parameters:
 *       - in: path
 *         name: bankId
 *         schema:
 *           type: string
 *         required: true
 *         description: bank ID to fetch reports for
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/ReportPeriod'
 *                 - type: object
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
bankRouter
  .route('/:bankId/next-report-period')
  .get(validation.bankIdValidation, handleExpressValidatorResult, getNextReportPeriodController.getNextReportPeriodByBankId);

/**
 * @openapi
 * /bank/:bankId/utilisation-reports/reconciliation-summary-by-year/:year:
 *   get:
 *     summary: |
 *       Utilisation reports for the specified submission
 *       year and bank. This includes status and details of
 *       reports that have been submitted.
 *     tags: [Utilisation Report]
 *     description: |
 *       Utilisation reports for the specified submission
 *       year and bank. This includes status and details of
 *       reports that have been submitted.
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/UtilisationReportReportReconciliationSummaryItem'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 */
bankRouter
  .route('/:bankId/utilisation-reports/reconciliation-summary-by-year/:year')
  .get(validation.bankIdValidation, validation.yearValidation('year'), handleExpressValidatorResult, getUtilisationReportSummariesByBankIdAndYear);

/**
 * @openapi
 * /bank/:bankId/fee-record-corrections/:correctionId/transient-form-data:
 *   put:
 *     summary: |
 *       Validate fee record correction form values and save
 *       fee record correction transient form data against a user
 *       and fee record correction
 *     tags: [Utilisation Report]
 *     description: |
 *       Validate fee record correction form values and save
 *       fee record correction transient form data against a user
 *       and fee record correction
 *     parameters:
 *       - in: path
 *         name: bankId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the bank
 *       - in: path
 *         name: correctionId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the fee record correction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               formData:
 *                 type: object
 *                 $ref: '#/definitions/FeeRecordCorrectionTransientFormDataRequestBody'
 *               user:
 *                 type: object
 *                 properties:
 *                   _id: string
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
bankRouter
  .route('/:bankId/fee-record-corrections/:correctionId/transient-form-data')
  .put(
    validation.bankIdValidation,
    validation.sqlIdValidation('correctionId'),
    handleExpressValidatorResult,
    validatePutFeeRecordCorrectionTransientFormDataPayload,
    putFeeRecordCorrectionTransientFormData,
  );

/**
 * @openapi
 * /bank/:bankId/fee-record-corrections/:correctionId:
 *   put:
 *     summary: |
 *       Save the transient form data for the requesting user
 *       and correction id combination to the fee record correction
 *       and send confirmation email to the bank and UKEF
 *     tags: [Utilisation Report]
 *     description: |
 *       Save the transient form data for the requesting user
 *       and correction id combination to the fee record correction
 *       and send confirmation email to the bank and UKEF
 *     parameters:
 *       - in: path
 *         name: bankId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the bank
 *       - in: path
 *         name: correctionId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the fee record correction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: object
 *                 properties:
 *                   _id: string
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
bankRouter
  .route('/:bankId/fee-record-corrections/:correctionId')
  .put(
    validation.bankIdValidation,
    validation.sqlIdValidation('correctionId'),
    handleExpressValidatorResult,
    validatePutFeeRecordCorrectionPayload,
    putFeeRecordCorrection,
  );

/**
 * @openapi
 * /bank/:bankId/utilisation-reports/pending-corrections:
 *   get:
 *     summary: Pending corrections for the oldest utilisation report with pending corrections
 *     tags: [Utilisation Report]
 *     description: Pending corrections for the oldest utilisation report with pending corrections
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/definitions/UtilisationReportPendingCorrections'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
bankRouter
  .route('/:bankId/utilisation-reports/pending-corrections')
  .get(validation.bankIdValidation, handleExpressValidatorResult, getUtilisationReportPendingCorrectionsByBankId);

/**
 * @openapi
 * /bank/:bankId/utilisation-reports/completed-corrections:
 *   get:
 *     summary: Gets completed fee record corrections by bank id
 *     tags: [Utilisation Report]
 *     description: Gets completed fee record corrections by bank id
 *     parameters:
 *       - in: path
 *         name: bankId
 *         schema:
 *           type: string
 *         required: true
 *         description: the id for the bank
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/CompletedFeeRecordCorrection'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
bankRouter
  .route('/:bankId/utilisation-reports/completed-corrections')
  .all(validation.bankIdValidation, handleExpressValidatorResult)
  .get(getCompletedFeeRecordCorrections);

module.exports = bankRouter;
