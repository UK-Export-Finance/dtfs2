const express = require('express');
const { getPortalActivities } = require('../controllers/activities-controller');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/activities:
 *   get:
 *     summary: Get portal activities for a specific deal and renders the application activity page.
 *     tags: [Portal - Gef]
 *     description: Get portal activities for a specific deal and renders the application activity page.
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
 */
router
  .route('/application-details/:dealId/activities')
  .all([validateToken, validateBank, validateRole({ role: [MAKER, CHECKER, READ_ONLY, ADMIN] })])
  .get(getPortalActivities);

module.exports = router;
