const express = require('express');
const { processCoverStartDate } = require('../../controllers/confirm-cover-start-date');
const { applicationDetails } = require('../../controllers/application-details');
const { validateRole, validateToken, validateBank } = require('../../middleware');
const { MAKER } = require('../../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/:facilityId/confirm-cover-start-date/:
 *   get:
 *     summary: Get the application details page
 *     tags: [Portal - Gef]
 *     description: Get the application details page
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
 *   post:
 *     summary: Process cover start date from application details page
 *     tags: [Portal - Gef]
 *     description: Process cover start date from application details page
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
  .route('/application-details/:dealId/:facilityId/confirm-cover-start-date/')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(applicationDetails)
  .post(processCoverStartDate);

module.exports = router;
