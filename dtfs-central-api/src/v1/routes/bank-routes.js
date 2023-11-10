const express = require('express');

const bankRouter = express.Router();

const getBankController = require('../controllers/bank/get-bank.controller');
const createBankController = require('../controllers/bank/create-bank.controller');
const previousReports = require('../controllers/utilisation-report-service/previous-reports.controller');

const validation = require('../validation/route-validators/route-validators');
const handleValidationResult = require('../validation/route-validators/validation-handler');

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
bankRouter.route('/:id').get(validation.bankIdValidation, handleValidationResult, getBankController.findOneBankGet);

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
bankRouter.route('/:bankId/utilisation-reports').get(validation.bankIdValidation, handleValidationResult, previousReports.getUtilisationReports);

module.exports = bankRouter;
