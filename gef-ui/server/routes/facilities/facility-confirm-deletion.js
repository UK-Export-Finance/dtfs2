const express = require('express');
const { facilityConfirmDeletion, deleteFacility } = require('../../controllers/facility-confirm-deletion');
const { validateRole, validateToken, validateBank } = require('../../middleware');
const { MAKER } = require('../../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/confirm-deletion:
 *   get:
 *     summary: Get the facility deletion confirmation page.
 *     tags: [Portal - Gef]
 *     description: Get the facility deletion confirmation page.
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
 *     summary: Deletes a facility and updates the application with the editor's ID.
 *     tags: [Portal - Gef]
 *     description: Deletes a facility and updates the application with the editor's ID.
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
  .route('/application-details/:dealId/facilities/:facilityId/confirm-deletion')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(facilityConfirmDeletion)
  .post(deleteFacility);

module.exports = router;
