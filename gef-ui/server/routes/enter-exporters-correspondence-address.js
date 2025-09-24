const express = require('express');
const { enterExportersCorrespondenceAddress, validateEnterExportersCorrespondenceAddress } = require('../controllers/enter-exporters-correspondence-address');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/enter-exporters-correspondence-address:
 *   get:
 *     summary: Get the exporter's correspondence address page.
 *     tags: [Portal - Gef]
 *     description: Get the exporter's correspondence address page.
 *     parameters:
 *       - in: path
 *         name: dealId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Validate and save the exporter's correspondence address.
 *     tags: [Portal - Gef]
 *     description: Validate and save the exporter's correspondence address.
 *     parameters:
 *       - in: path
 *         name: dealId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *       - in: query
 *         name: saveAndReturn
 *         schema:
 *           type: string
 *           example: 'true'
 *         description: indicates if the user clicked 'Save and return to application'
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: 'DRAFT'
 *         description: the deal status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource moved permanently
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/application-details/:dealId/enter-exporters-correspondence-address')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(enterExportersCorrespondenceAddress)
  .post(validateEnterExportersCorrespondenceAddress);

module.exports = router;
