const express = require('express');
const { nameApplication, createApplication, updateApplicationReferences } = require('../controllers/name-application');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

/**
 * @openapi
 * /name-application:
 *   get:
 *     summary: Get the name application view.
 *     tags: [Portal - Gef]
 *     description: Get the name application view.
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       422:
 *         description: Unable to get name application view
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Creates a new application
 *     tags: [Portal - Gef]
 *     description: Creates a new application
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
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       422:
 *         description: Unable to create the application
 *       500:
 *         description: Internal server error
 */
router
  .route('/name-application')
  .all([validateToken, validateRole({ role: [MAKER] })])
  .get(nameApplication)
  .post(createApplication);

/**
 * @openapi
 * /applications/:dealId/name:
 *   get:
 *     summary: Get the name application view.
 *     tags: [Portal - Gef]
 *     description: Get the name application view.
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
 *       422:
 *         description: Unable to get name application view
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Updates the application references for a given deal.
 *     tags: [Portal - Gef]
 *     description: Updates the application references for a given deal.
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
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       422:
 *         description: Unable to update the application references
 *       500:
 *         description: Internal server error
 */
router
  .route('/applications/:dealId/name')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(nameApplication)
  .post(updateApplicationReferences);

module.exports = router;
