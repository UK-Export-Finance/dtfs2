const express = require('express');

const bankRouter = express.Router();

const getBankController = require('../controllers/bank/get-bank.controller');
const getBanksController = require('../controllers/bank/get-banks.controller');
const createBankController = require('../controllers/bank/create-bank.controller');
const getNextReportPeriodController = require('../controllers/bank/get-next-report-period-by-bank.controller');
const { getUtilisationReportsByBankIdAndOptions } = require('../controllers/utilisation-report-service/get-utilisation-reports.controller');
const {
  getUtilisationReportSummariesByBankIdAndYear,
} = require('../controllers/utilisation-report-service/get-utilisation-reports-reconciliation-summary.controller');

const validation = require('../validation/route-validators/route-validators');
const handleExpressValidatorResult = require('../validation/route-validators/express-validator-result-handler');

/**
 * @openapi
 * /bank:
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
bankRouter.route('/').post(createBankController.createBankPost);

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
 * /bank:
 *   get:
 *     summary: Get an array of all banks in the banks collection
 *     tags: [Bank]
 *     description: Get an array of all banks in the banks collection
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/definitions/Bank'
 *                   - type: object
 *                     properties:
 *                       _id:
 *                         example: 123456abc
 */
bankRouter.route('/').get(getBanksController.getAllBanksGet);

/**
 * @openapi
 * /bank/:bankId/utilisation-reports:
 *   get:
 *     summary: Get utilisation reports by bank ID
 *     tags: [UtilisationReport]
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
 *     tags: [UtilisationReport]
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
 *     tags: [UtilisationReport]
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

module.exports = bankRouter;
