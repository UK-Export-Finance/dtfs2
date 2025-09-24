const express = require('express');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { getMandatoryCriteria } = require('../controllers/mandatory-criteria');
const { cloneDealValidateMandatoryCriteria, cloneDealNameApplication, cloneDealCreateApplication } = require('../controllers/clone-gef-deal');
const { MAKER } = require('../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/clone:
 *   get:
 *     summary: Get mandatory criteria page
 *     tags: [Portal - Gef]
 *     description: Get mandatory criteria page
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
 *     summary: Handles validating and saving mandatory criteria answers
 *     tags: [Portal - Gef]
 *     description: Handles validating and saving mandatory criteria answers
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
  .route('/application-details/:dealId/clone')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getMandatoryCriteria)
  .post(cloneDealValidateMandatoryCriteria);

/**
 * @openapi
 * /application-details/:dealId/clone/name-application:
 *   get:
 *     summary: Get the name application for a cloned GEF deal.
 *     tags: [Portal - Gef]
 *     description: Get the name application for a cloned GEF deal.
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
 *     summary: Handles the creation of a cloned GEF deal application.
 *     tags: [Portal - Gef]
 *     description: Handles the creation of a cloned GEF deal application.
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
  .route('/application-details/:dealId/clone/name-application')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(cloneDealNameApplication)
  .post(cloneDealCreateApplication);

module.exports = router;
