const express = require('express');
const eligibleAutomaticCover = require('../controllers/eligible-automatic-cover');
const ineligibleGef = require('../controllers/ineligible-gef');
const ineligibleAutomaticCover = require('../controllers/ineligible-automatic-cover');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

/**
 * @openapi
 * application-details/:dealId/eligible-automatic-cover:
 *   get:
 *     summary: Get eligible automatic cover page
 *     tags: [Portal - Gef]
 *     description: Get eligible automatic cover page
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
 */
router.get('/application-details/:dealId/eligible-automatic-cover', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  eligibleAutomaticCover(req, res),
);

/**
 * @openapi
 * /application-details/:dealId/ineligible-automatic-cover:
 *   get:
 *     summary: Get ineligible automatic cover page
 *     tags: [Portal - Gef]
 *     description: Get ineligible automatic cover page
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
 */
router.get('/application-details/:dealId/ineligible-automatic-cover', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  ineligibleAutomaticCover(req, res),
);

/**
 * @openapi
 * /ineligible-gef:
 *   get:
 *     summary: Get ineligible gef page
 *     tags: [Portal - Gef]
 *     description: Get ineligible gef page
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 */
router.get('/ineligible-gef', [validateToken, validateRole({ role: [MAKER] })], (req, res) => ineligibleGef(req, res));

module.exports = router;
