const express = require('express');
const { getMandatoryCriteria, validateMandatoryCriteria } = require('../controllers/mandatory-criteria');
const { validateRole, validateToken } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /mandatory-criteria:
 *   get:
 *     summary: Get mandatory criteria page
 *     tags: [Portal - Gef]
 *     description: Get mandatory criteria page
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
 *     summary: Post mandatory criteria answers
 *     tags: [Portal - Gef]
 *     description: Post mandatory criteria answers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mandatoryCriteria:
 *                 type: string
 *           example:
 *             mandatoryCriteria: 'true'
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource moved permanently
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/mandatory-criteria')
  .all([validateToken, validateRole({ role: [MAKER] })])
  .get(getMandatoryCriteria)
  .post(validateMandatoryCriteria);

module.exports = router;
