const express = require('express');
const { automaticCover, validateAutomaticCover } = require('../controllers/automatic-cover');

const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/automatic-cover:
 *   get:
 *     summary: Get the automatic cover page
 *     tags: [Portal - Gef]
 *     description: Get the automatic cover page
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
 *     summary: Handles validating and saving automatic cover answers
 *     tags: [Portal - Gef]
 *     description: Handles validating and saving automatic cover answers
 *     parameters:
 *       - in: path
 *         name: dealId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *       - in: query
 *         name: saveAndReturn
 *         schema:
 *           type: string
 *           example: 'true'
 *         description: indicates if the user clicked 'Save and return to application'
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
  .route('/application-details/:dealId/automatic-cover')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(automaticCover)
  .post(validateAutomaticCover);

module.exports = router;
