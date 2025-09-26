const express = require('express');
const { getSecurityDetails, postSecurityDetails } = require('../controllers/supporting-information/security-details');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/supporting-information/security-details:
 *   get:
 *     summary: Get the security details for a specific application.
 *     tags: [Portal - Gef]
 *     description: Get the security details for a specific application.
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
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: POST request to update security details for a given application.
 *     tags: [Portal - Gef]
 *     description: POST request to update security details for a given application.
 *     parameters:
 *       - in: path
 *         name: dealId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               exporterSecurity:
 *                 type: string
 *               facilitySecurity:
 *                 type: string
 *           example:
 *             exporterSecurity: "exporter security details"
 *             facilitySecurity: "applications security details"
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource moved permanently
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/application-details/:dealId/supporting-information/security-details')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getSecurityDetails)
  .post(postSecurityDetails);

module.exports = router;
