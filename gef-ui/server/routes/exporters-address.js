const express = require('express');
const { exportersAddress, validateExportersAddress } = require('../controllers/exporters-address');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/exporters-address:
 *   get:
 *     summary: Get the exporter's address page.
 *     tags: [Portal - Gef]
 *     description: Get the exporter's address page.
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
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Validate the exporters address form submission.
 *     tags: [Portal - Gef]
 *     description: Validate the exporters address form submission.
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
 *               correspondence:
 *                 type: string
 *               postcode:
 *                 type: string
 *           example:
 *             correspondence: 'true'
 *             postcode: 'E1 8QS'
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
  .route('/application-details/:dealId/exporters-address')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(exportersAddress)
  .post(validateExportersAddress);

module.exports = router;
