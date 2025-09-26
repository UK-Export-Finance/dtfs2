const express = require('express');
const { applicationDetails } = require('../../controllers/application-details');
const { validateRole, validateToken, validateBank } = require('../../middleware');
const { MAKER } = require('../../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/cover-start-date:
 *   get:
 *     summary: Get the application details page
 *     tags: [Portal - Gef]
 *     description: Get the application details page
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
  .route('/application-details/:dealId/cover-start-date')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(applicationDetails);

module.exports = router;
