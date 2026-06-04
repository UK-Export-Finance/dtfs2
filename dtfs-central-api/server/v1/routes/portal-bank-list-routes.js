const express = require('express');

const { getPortalBankList } = require('../controllers/portal-bank-list/get-portal-bank-list.controller');

const portalBankListRouter = express.Router();

/**
 * @openapi
 * /portal-bank-list:
 *   get:
 *     summary: Get the list of approved banks displayed on the portal homepage
 *     tags: [Portal Bank List]
 *     description: Returns all entries in the portal-bank-list MongoDB collection, sorted by order then name.
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 65e2f0c5f0c1c0a1b8b8b8b8
 *                   name:
 *                     type: string
 *                     example: Barclays Bank
 *                   order:
 *                     type: number
 *                     example: 1
 */
portalBankListRouter.route('/').get(getPortalBankList);

module.exports = portalBankListRouter;
