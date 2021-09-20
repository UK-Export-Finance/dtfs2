const express = require('express');

const bankRouter = express.Router();

const getBankController = require('../controllers/bank/get-bank.controller');
const createBankController = require('../controllers/bank/create-bank.controller');

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
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Bank id. Separate MongoDB _id
 *               name:
 *                 type: string
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *               companiesHouseNo:
 *                 type: string
 *               partyUrn:
 *                 type: string
 *           example:
 *             id: '9'
 *             name: UKEF test bank (Delegated)
 *             emails: ['maker1@ukexportfinance.gov.uk', 'checker1@ukexportfinance.gov.uk']
 *             companiesHouseNo: 'UKEF0001'
 *             partyUrn: '00318345'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: '123456abc'
 */
bankRouter.route('/')
  .post(
    createBankController.createBankPost,
  );

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
 *             example:
 *               _id: '123456abc'
 *               id: '9'
 *               name: UKEF test bank (Delegated)
 *               emails: ['maker1@ukexportfinance.gov.uk', 'checker1@ukexportfinance.gov.uk']
 *               companiesHouseNo: 'UKEF0001'
 *               partyUrn: '00318345'
 *       404:
 *         description: Not found
 */
bankRouter.route('/:id')
  .get(
    getBankController.findOneBankGet,
  );


module.exports = bankRouter;
