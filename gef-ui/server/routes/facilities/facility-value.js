const express = require('express');
const { facilityValue, updateFacilityValue } = require('../../controllers/facility-value');
const { validateRole, validateToken, validateBank } = require('../../middleware');
const { MAKER } = require('../../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/facility-value:
 *   get:
 *     summary: Get the facility value page
 *     tags: [Portal - Gef]
 *     description: Get the facility value page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *     responses:
 *       200:
 *         description: OK
 *       302:
 *         description: Resource temporarily moved
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
 *     summary: Updates the facility value for a facility within a deal.
 *     tags: [Portal - Gef]
 *     description: Updates the facility value for a facility within a deal.
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: 'DRAFT'
 *         description: the deal status
 *       - in: query
 *         name: saveAndReturn
 *         schema:
 *           type: string
 *           example: 'true'
 *         description: indicates if the user clicked 'Save and return to application'
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
 */
router
  .route('/application-details/:dealId/facilities/:facilityId/facility-value')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(facilityValue)
  .post(updateFacilityValue);

module.exports = router;
