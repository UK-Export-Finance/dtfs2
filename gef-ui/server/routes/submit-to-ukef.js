const express = require('express');
const { submitToUkef, createSubmissionToUkef } = require('../controllers/submit-to-ukef');
const { validateBank, validateRole, validateToken } = require('../middleware');
const { CHECKER } = require('../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/submit-to-ukef:
 *   get:
 *     summary: Get the submit to ukef page for a given deal.
 *     tags: [Portal - Gef]
 *     description: Get the submit to ukef page for a given deal.
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
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post the submission of a GEF application to UKEF.
 *     tags: [Portal - Gef]
 *     description: Post the submission of a GEF application to UKEF.
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
 *               confirmSubmitUkef:
 *                 type: string
 *           example:
 *             confirmSubmitUkef: 'true'
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
 */
router
  .route('/application-details/:dealId/submit-to-ukef')
  .all([validateToken, validateBank, validateRole({ role: [CHECKER] })])
  .get(submitToUkef)
  .post(createSubmissionToUkef);

module.exports = router;
