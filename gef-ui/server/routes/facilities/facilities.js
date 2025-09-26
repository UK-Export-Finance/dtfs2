const express = require('express');
const { facilities, createFacility } = require('../../controllers/facilities');
const { validateRole, validateToken, validateBank } = require('../../middleware');
const { MAKER } = require('../../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/facilities:
 *   get:
 *     summary: Get the facilities template
 *     tags: [Portal - Gef]
 *     description: Get the facilities template
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
 *     summary: Handles the creation or update of a facility for a given deal.
 *     tags: [Portal - Gef]
 *     description: Handles the creation or update of a facility for a given deal.
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
 *               hasBeenIssued:
 *                 type: boolean
 *                 description: Indicates whether the facility has been issued.
 *           example: true
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
  .route('/application-details/:dealId/facilities')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(facilities)
  .post(createFacility);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId:
 *   get:
 *     summary: Get the appropriate template with facility information for a given deal.
 *     tags: [Portal - Gef]
 *     description: Get the appropriate template with facility information for a given deal.
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hasBeenIssued:
 *                 type: boolean
 *                 description: Indicates whether the facility has been issued.
 *           example: true
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
 *     summary: Handles the creation or update of a facility for a given deal.
 *     tags: [Portal - Gef]
 *     description: Handles the creation or update of a facility for a given deal.
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
  .route('/application-details/:dealId/facilities/:facilityId')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(facilities)
  .post(createFacility);

module.exports = router;
