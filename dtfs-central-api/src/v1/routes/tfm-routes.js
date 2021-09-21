const express = require('express');

const tfmRouter = express.Router();

const tfmGetDealController = require('../controllers/tfm/deal/tfm-get-deal.controller');
const tfmGetDealsController = require('../controllers/tfm/deal/tfm-get-deals.controller');
const tfmUpdateDealController = require('../controllers/tfm/deal/tfm-update-deal.controller');
const tfmDeleteDealController = require('../controllers/tfm/deal/tfm-delete-deal.controller');
const tfmSubmitDealController = require('../controllers/tfm/deal/tfm-submit-deal.controller');
const tfmGetFacilitiesController = require('../controllers/tfm/facility/tfm-get-facilities.controller');
const tfmGetFacilityController = require('../controllers/tfm/facility/tfm-get-facility.controller');
const tfmUpdateFacilityController = require('../controllers/tfm/facility/tfm-update-facility.controller');

const tfmTeamsController = require('../controllers/tfm/users/tfm-teams.controller');
const tfmUsersController = require('../controllers/tfm/users/tfm-users.controller');

const { TFM_ROUTE } = require('../../constants/routes');

tfmRouter.use((req, res, next) => {
  req.routePath = TFM_ROUTE;
  next();
});

/**
 * @openapi
 * definitions:
 *   TFMDeal:
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *         example: 123abc
 *       dealSnapshot:
 *         type: object
 *         properties:
 *           _id:
 *             type: string
 *             example: 123abc
 *           dealType:
 *             type: string
 *             example: BSS/EWCS
 *           status:
 *             type: string
 *             example: Submitted
 *           submissionCount:
 *             type: integer
 *             example: 1
 *       tfm:
 *         type: object
 *         properties:
 *           product:
 *             type: string
 *             example: BSS
 *           dateReceived:
 *             type: string
 *             example: '16-09-2021'
 *           stage:
 *             type: string
 *             example: Confirmed
 *           exporterCreditRating:
 *             type: string
 *             example: Acceptable (B+)
 *   TFMUser:
 *     type: object
 *     properties:
 *       username:
 *         type: string
 *         example: T1_USER_1
 *       email:
 *         type: test@testing.com
 *       teams:
 *         type: array
 *         items:
 *           type: string
 *         example: ['BUSINESS_SUPPORT']
 *       timezone:
 *         type: string
 *         example: Europe/London
 *       firstName:
 *         type: string
 *         example: Joe
 *       lastName:
 *         type: string
 *         example: Bloggs
 *   TFMUsers:
 *     type: array
 *     items:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           example: T1_USER_1
 *         email:
 *           type: test@testing.com
 *         teams:
 *           type: array
 *           items:
 *             type: string
 *           example: ['BUSINESS_SUPPORT']
 *         timezone:
 *           type: string
 *           example: Europe/London
 *         firstName:
 *           type: string
 *           example: Joe
 *         lastName:
 *           type: string
 *           example: Bloggs
 *   TFMTeam:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *         example: BUSINESS_SUPPORT
 *       name:
 *         type: string
 *         example: Business support group
 *       email:
 *         type: team@email.com
 */

/**
 * @openapi
 * /tfm/deals/submit:
 *   put:
 *     summary: Submit a deal. Adds to tfm-deals and tfm-facilities collections
 *     tags: [TFM]
 *     description: Creates deal and facility snapshots (See README)
 *     requestBody:
 *       description: Fields required to find a deal and associated facilities
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
 *             example:
 *               dealId: 123abc
 *               dealType: GEF
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/TFMDeal'
 *       404:
 *         description: Not found
 */
tfmRouter.route('/deals/submit')
  .put(
    tfmSubmitDealController.submitDealPut,
  );

/**
* @openapi
* /tfm/deals/:id:
*   get:
*     summary: Get a TFM deal
*     tags: [TFM]
*     description: Get a TFM deal. Returns associated facilities snapshot data inside deal.dealSnapshot.facilities
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: Deal ID to get
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             schema:
*               allOf:
*                 - $ref: '#/definitions/TFMDeal'
*                 - type: object
*                   properties:
*                     dealSnapshot:
*                       type: object
*                       properties:
*                         facilities:
*                           example: [ { _id: 123abc, type: CASH }, { _id: 456abc, type: CONTINGENT } ]
*       404:
*         description: Not found
*/
tfmRouter.route('/deals/:id').get(
  tfmGetDealController.findOneDealGet,
);

/**
* @openapi
* /tfm/deals/:id:
*   put:
*     summary: Update a TFM deal
*     tags: [TFM]
*     description: Update a TFM deal. Only updates deal.tfm, not deal.dealSnapshot
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: Deal ID to update
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             example:
*               tfm:
*                 lossGivenDefault: 50
*                 exporterCreditRating: Good (BB-)
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             schema:
*               allOf:
*                 - $ref: '#/definitions/TFMDeal'
*                 - type: object
*                   properties:
*                     tfm:
*                       type: object
*                       properties:
*                         lossGivenDefault:
*                           example: 50
*                         exporterCreditRating:
*                           example: Good (BB-)
*       404:
*         description: Not found
*/
tfmRouter.route('/deals/:id').put(
  tfmUpdateDealController.updateDealPut,
);

tfmRouter.route('/deals/:id').delete(
  tfmDeleteDealController.deleteDeal,
);

/**
 * @openapi
 * /tfm/deals/:id/snapshot:
 *   put:
 *     summary: Update a TFM deal's dealSnapshot
 *     tags: [TFM]
 *     description: This is only used once inside of TFM deal submit. Should otherwise never be used. See README
 *     requestBody:
 *       description: Snapshot fields to add or update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               aNewField: true
 *               aChangedField: New value
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/TFMDeal'
 *                 - type: object
 *                   properties:
 *                     dealSnapshot:
 *                       type: object
 *                       properties:
 *                         aNewField:
 *                           example: true
 *                         aChangedField:
 *                           example: New value
 *       404:
 *         description: Not found
 */
tfmRouter.route('/deals/:id/snapshot')
  .put(
    tfmUpdateDealController.updateDealSnapshotPut,
  );

tfmRouter.route('/deals')
  .get(
    tfmGetDealsController.findDealsGet,
  );

tfmRouter.route('/deals/:id/facilities')
  .get(
    tfmGetFacilitiesController.findFacilitiesGet,
  );

tfmRouter.route('/facilities/:id')
  .get(
    tfmGetFacilityController.findOneFacilityGet,
  )
  .put(
    tfmUpdateFacilityController.updateFacilityPut,
  );

tfmRouter.route('/teams').get(
  tfmTeamsController.listTeamsGET,
);

/**
 * @openapi
 * /tfm/teams:
 *   post:
 *     summary: Create a team in tfm-teams collection
 *     tags: [TFM]
 *     description: Create a team in tfm-teams collection
 *     requestBody:
 *       description: Fields required to create a team. No validation in place.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/TFMTeam'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: '123456abc'
 */
tfmRouter.route('/teams').post(
  tfmTeamsController.createTeamPOST,
);

/**
 * @openapi
 * /tfm/teams/:id:
 *   get:
 *     summary: Get a team by ID
 *     tags: [TFM]
 *     description: Get a team by ID. Not MongoDB _id, but the team ID provided when created.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Team ID to get
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/TFMTeam'
 *       404:
 *         description: Not found
 */
tfmRouter.route('/teams/:id')
  .get(
    tfmTeamsController.findOneTeamGET,
  );

/**
 * @openapi
 * /tfm/teams/:id:
 *   delete:
 *     summary: Delete a team
 *     tags: [TFM]
 *     description: Delete a team by ID. Not MongoDB _id, but the team ID provided when created.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Team ID to delete
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               acknowledged: true
 *               deletedCount: 1
 */
tfmRouter.route('/teams/:id').delete(
  tfmTeamsController.deleteTeamDELETE,
);

/**
 * @openapi
 * /tfm/users:
 *   get:
 *     summary: Get all TFM users
 *     tags: [TFM]
 *     description: Get all TFM users
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/TFMUsers'
 */
tfmRouter.route('/users').get(
  tfmUsersController.listUsersGET,
);

/**
 * @openapi
 * /tfm/users:
 *   post:
 *     summary: Create a user in tfm-users collection
 *     tags: [TFM]
 *     description: Create a users in tfm-users collection
 *     requestBody:
 *       description: Fields required to create a user. No validation in place.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/TFMUser'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: '123456abc'
 */
tfmRouter.route('/users').post(
  tfmUsersController.createUserPOST,
);

/**
 * @openapi
 * /tfm/users/:username:
 *   get:
 *     summary: Get a TFM user by username
 *     tags: [TFM]
 *     description: Get a TFM user by username
 *     parameters:
*       - in: path
*         name: username
*         schema:
*           type: string
*         required: true
*         description: Username to get
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/TFMUser'
 *       404:
 *         description: Not found
 */
tfmRouter.route('/users/:username')
  .get(
    tfmUsersController.findOneUserGET,
  );

/**
* @openapi
* /tfm/users/:username:
*   delete:
*     summary: Delete a user
*     tags: [TFM]
*     description: Delete a user by username
*     parameters:
*       - in: path
*         name: username
*         schema:
*           type: string
*         required: true
*         description: User to delete
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             example:
*               acknowledged: true
*               deletedCount: 1
*/
tfmRouter.route('/users/:username').delete(
  tfmUsersController.deleteUserDELETE,
);

/**
 * @openapi
 * /tfm/users/:id:
 *   get:
 *     summary: Get a TFM user by ID
 *     tags: [TFM]
 *     description: Get a TFM user by ID
 *     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: User ID to get
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/TFMUser'
 *       404:
 *         description: Not found
 */
tfmRouter.route('/users/id/:userId')
  .get(
    tfmUsersController.findOneUserByIdGET,
  );

/**
* @openapi
* /tfm/users/team/:teamId:
*   get:
*     summary: Get all TFM users in a team
*     tags: [TFM]
*     description: Get all TFM users in a team by team ID
*     parameters:
*       - in: path
*         name: teamId
*         schema:
*           type: string
*         required: true
*         description: Team ID to get. Not MongoDB _id, but the team ID provided when created.
*     responses:
*       200:
*         description: OK
*         content:
*           application/json:
*             schema:
*               $ref: '#/definitions/TFMUsers'
*/
tfmRouter.route('/users/team/:teamId')
  .get(
    tfmUsersController.findTeamUsersGET,
  );

module.exports = tfmRouter;
