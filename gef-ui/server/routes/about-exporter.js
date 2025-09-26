const express = require('express');
const { aboutExporter, validateAboutExporter } = require('../controllers/about-exporter');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/about-exporter:
 *   get:
 *     summary: Get the about exporter page
 *     tags: [Portal - Gef]
 *     description: Get the about exporter page
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
 *     summary: Validates and updates the about exporter form.
 *     tags: [Portal - Gef]
 *     description: Validates and updates the about exporter form.
 *     parameters:
 *       - in: path
 *         name: dealId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: 'DRAFT'
 *         description: the deal status
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
  .route('/application-details/:dealId/about-exporter')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(aboutExporter)
  .post(validateAboutExporter);

module.exports = router;
