const express = require('express');
const { getReturnToMaker, postReturnToMaker } = require('../controllers/return-to-maker');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { CHECKER } = require('../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/return-to-maker:
 *   get:
 *     summary: Get the return to maker page.
 *     tags: [Portal - Gef]
 *     description: Get the return to maker page.
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
 *     summary: Post request to return a deal to the maker with comments.
 *     tags: [Portal - Gef]
 *     description: Post request to return a deal to the maker with comments.
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
 *               comment:
 *                 type: string
 *           example:
 *             comment: 'Some comments here'
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
  .route('/application-details/:dealId/return-to-maker')
  .all([validateToken, validateBank, validateRole({ role: [CHECKER] })])
  .get(getReturnToMaker)
  .post(postReturnToMaker);

module.exports = router;
