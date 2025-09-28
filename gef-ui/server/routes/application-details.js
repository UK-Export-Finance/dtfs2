const express = require('express');
const { applicationDetails, postApplicationDetails } = require('../controllers/application-details');
const { validateToken, validateBank, validateRole } = require('../middleware');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId:
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
 *     summary: POST requests for application details
 *     tags: [Portal - Gef]
 *     description: POST requests for application details
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
 *       301:
 *         description: Resource moved permanently
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 */
router
  .route('/application-details/:dealId')
  .all([validateToken, validateBank])
  .get([validateRole({ role: [MAKER, CHECKER, READ_ONLY, ADMIN] })], applicationDetails)
  .post([validateRole({ role: [MAKER] })], postApplicationDetails);

module.exports = router;
