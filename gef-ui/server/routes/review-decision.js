const express = require('express');
const { acceptUkefDecision } = require('../controllers/review-decision');
const { applicationDetails } = require('../controllers/application-details');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/review-decision:
 *   get:
 *     summary: Get the application details page.
 *     tags: [Portal - Gef]
 *     description: Get the application details page.
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
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Handles the acceptance of a UKEF decision for a given deal.
 *     tags: [Portal - Gef]
 *     description: Handles the acceptance of a UKEF decision for a given deal.
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
 *               decision:
 *                 type: boolean
 *           example:
 *             decision: true
 *     responses:
 *       200:
 *         description: OK
 *       302:
 *         description: Resource moved temporarily
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/application-details/:dealId/review-decision')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(applicationDetails)
  .post(acceptUkefDecision);

module.exports = router;
