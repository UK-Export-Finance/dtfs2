const express = require('express');
const { facilityGuarantee, updateFacilityGuarantee } = require('../../controllers/facility-guarantee');
const { validateRole, validateToken, validateBank } = require('../../middleware');
const { MAKER } = require('../../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/facility-guarantee:
 *   get:
 *     summary: Get the facility guarantee page for a facility within a deal.
 *     tags: [Portal - Gef]
 *     description: Get the facility guarantee page for a facility within a deal.
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
 *     summary: Updates the facility guarantee details for a facility within a deal.
 *     tags: [Portal - Gef]
 *     description: Updates the facility guarantee details for a facility within a deal.
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
  .route('/application-details/:dealId/facilities/:facilityId/facility-guarantee')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(facilityGuarantee)
  .post(updateFacilityGuarantee);

module.exports = router;
