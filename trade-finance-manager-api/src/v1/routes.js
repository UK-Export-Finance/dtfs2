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
 *     description: Creates snapshots, calls external APIs, sends status update to internal APIs. See README
 *     requestBody:
 *       description: Fields required to find a deal and send updates to Portal. The checker object is for Portal update
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
 *         content:
 *           application/json:
 *             example:
 *               _id: 123abc
 *               dealSnapshot:
 *                 _id: 123abc
 *                 dealType: BSS/EWCS
 *                 status: Submitted
 *                 submissionCount: 1
 *                 facilities: ['123', '456']
 *               tfm:
 *                 product: BSS & EWCS
 *                 dateReceived: 16-09-2021
 *                 stage: Confirmed
 *                 exporterCreditRating: Acceptable (B+)
 *       404:
 *         description: Not found
 */
openRouter.route('/deals/submit')
  .put(
    dealSubmit.submitDealPUT,
  );

openRouter.route('/deals/submitDealAfterUkefIds')
  .put(
    dealSubmit.submitDealAfterUkefIdsPUT,
  );

// Mock user routes. Not required once active directory login is enabled
/**
 * @openapi
 * /users/:username:
 *   get:
 *     summary: Get a user by username
 *     tags: [Users]
 *     description: Get a user by username. This will be replaced by Single Sign On authentication
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username of the user to get
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: 123abc
 *               username: T1_USER_1
 *               email: test@testing.com
 *               teams: ['BUSINESS_SUPPORT']
 *               timezone: Europe/London
 *               firstName: Joe
 *               lastName: Bloggs
 *       404:
 *         description: Not found
 */
openRouter.route('/users/:username')
  .get(
    userController.findUserGET,
  );

module.exports = openRouter;
