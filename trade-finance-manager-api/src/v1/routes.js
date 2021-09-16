const express = require('express');
const swaggerUi = require('swagger-ui-express');

const openRouter = express.Router();

const {
  swaggerSpec,
  swaggerUiOptions,
} = require('./swagger');
const dealSubmit = require('./controllers/deal.submit.controller');
const userController = require('./controllers/user.controller');

openRouter.route('/api-docs')
  .get(
    swaggerUi.setup(swaggerSpec, swaggerUiOptions),
  );

/**
 * @openapi
 * /deals/submit:
 *   put:
 *     summary: Submit a deal
 *     tags: [Deals]
 *     description: Creates snapshots, calls external APIs, sends status update to internal APIs
 *     requestBody:
 *       description: Fields required to find a deal and send updates back to Portal/BSS. Note - the checker object is only required to send an update back to BSS
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dealId:
 *                 type: string
 *               dealType:
 *                 type: string
 *               checker:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   firstname:
 *                     type: string
 *                   surname:
 *                     type: string
 *             example:
 *               dealId: 123abc
 *               dealType: BSS/EWCS
 *               checker:
 *                 _id: 123abc
 *                 username: BANK1_CHECKER1
 *                 firstname: Joe
 *                 surname: Bloggs
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
openRouter.route('/deals/submit')
  .put(
    dealSubmit.submitDealPUT,
  );

// Mock user routes. Not required once active directory login is enabled
/**
 * @openapi
 * /users/:username:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     description: Get a user by ID
 *     responses:
 *       200:
 *         description: user
 *       404:
 *         description: Not found
 */
openRouter.route('/users/:username')
  .get(
    userController.findUserGET,
  );

module.exports = openRouter;
