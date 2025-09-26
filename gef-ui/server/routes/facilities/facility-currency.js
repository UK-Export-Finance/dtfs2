const express = require('express');
const { facilityCurrency, updateFacilityCurrency } = require('../../controllers/facility-currency');
const { validateRole, validateToken, validateBank } = require('../../middleware');
const { MAKER } = require('../../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/facility-currency:
 *   get:
 *     summary: Get the facility currency selection page
 *     tags: [Portal - Gef]
 *     description: Get the facility currency selection page
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
 *     summary: Update the facility's currency
 *     tags: [Portal - Gef]
 *     description: Update the facility's currency
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
 *         description: Resource temporary moved
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
  .route('/application-details/:dealId/facilities/:facilityId/facility-currency')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(facilityCurrency)
  .post(updateFacilityCurrency);

module.exports = router;
