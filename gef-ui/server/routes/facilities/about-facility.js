const express = require('express');
const { aboutFacility, validateAndUpdateAboutFacility } = require('../../controllers/about-facility');
const { validateRole, validateToken, validateBank } = require('../../middleware');
const { MAKER } = require('../../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/about-facility:
 *   get:
 *     summary: Get about this facility page
 *     tags: [Portal - Gef]
 *     description: Get about this facility page
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
 *     summary: Update facility
 *     tags: [Portal - Gef]
 *     description: Update facility
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
  .route(`/application-details/:dealId/facilities/:facilityId/about-facility`)
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(aboutFacility)
  .post(validateAndUpdateAboutFacility);

module.exports = router;
