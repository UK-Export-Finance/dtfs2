const express = require('express');
const {
  selectExportersCorrespondenceAddress,
  validateSelectExportersCorrespondenceAddress,
} = require('../controllers/select-exporters-correspondence-address');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/select-exporters-correspondence-address:
 *   get:
 *     summary: Get the selection of an exporter's correspondence address.
 *     tags: [Portal - Gef]
 *     description: Get the selection of an exporter's correspondence address.
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
 *     summary: Post the selected exporter correspondence address from the request body.
 *     tags: [Portal - Gef]
 *     description: Post the selected exporter correspondence address from the request body.
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
 *               selectedAddress:
 *                 type: string
 *           example:
 *             selectedAddress: 'Addresses Found'
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 */
router
  .route('/application-details/:dealId/select-exporters-correspondence-address')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(selectExportersCorrespondenceAddress)
  .post(validateSelectExportersCorrespondenceAddress);

module.exports = router;
