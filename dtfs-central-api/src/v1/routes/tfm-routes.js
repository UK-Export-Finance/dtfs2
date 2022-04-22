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
const tfmGetFacilityAmendmentsController = require('../controllers/tfm/facility/tfm-get-amendments.controller');
const tfmUpdateFacilityAmendmentsController = require('../controllers/tfm/facility/tfm-update-amendments.controller');

const tfmTeamsController = require('../controllers/tfm/users/tfm-teams.controller');
const tfmUsersController = require('../controllers/tfm/users/tfm-users.controller');

const { TFM_ROUTE } = require('../../constants/routes');

tfmRouter.use((req, res, next) => {
  req.routePath = TFM_ROUTE;
  next();
});

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
 *               dealId: 61e54dd5b578247e14575882
 *               dealType: GEF
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/TFMDealBSS'
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
*                 - $ref: '#/definitions/TFMDealBSS'
*                 - type: object
*                   properties:
*                     dealSnapshot:
*                       type: object
*                       properties:
*                         facilities:
*                           example: [ { _id: '123abc', type: 'Cash' }, { _id: '456abc', type: 'Contingent' } ]
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
*                 - $ref: '#/definitions/TFMDealBSS'
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

/**
 * @openapi
 * /tfm/deals/:id:
 *   delete:
 *     summary: Delete a TFM deal
 *     tags: [TFM]
 *     description: Delete a deal by ID. Also deletes any facilities associated with the deal.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Deal ID to delete
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               acknowledged: true
 *               deletedCount: 1
 */
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
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/TFMDealBSS'
 *                 - type: object
 *                   properties:
 *                     dealSnapshot:
 *                       type: object
 *                       properties:
 *                         aNewField:
 *                           example: true
 *       404:
 *         description: Not found
 */
tfmRouter.route('/deals/:id/snapshot')
  .put(
    tfmUpdateDealController.updateDealSnapshotPut,
  );

/**
 * @openapi
 * /tfm/deals:
 *   get:
 *     summary: Get TFM deals
 *     tags: [TFM]
 *     description: Get TFM deals
 *     requestBody:
 *       description: Search string and sortBy values
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               queryParams:
 *                 type: object
 *                 properties:
 *                   searchString:
 *                     type: string
 *                     example: HSBC bank
 *                   byField:
 *                     type: array
 *                     items:
 *                       type: object
 *                       example: { name: 'tfm.dateReceived', value: '25-12-2021' }
 *                   sortBy:
 *                     type: object
 *                     example: { order: ascending }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               deals: [ { _id: '123456abc', allFields: true }, { _id: '123456abc', allFields: true } ]
 */
tfmRouter.route('/deals')
  .get(
    tfmGetDealsController.findDealsGet,
  );

/**
 * @openapi
 * /tfm/deals/:id/facilities:
 *   get:
 *     summary: Get TFM facilities associated with a deal ID
 *     tags: [TFM]
 *     description: Get TFM facilities associated with a deal ID. This currently only works for GEF facilities
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Deal ID to get facilities for
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example: [ { _id: '123456abc', allFields: true }, { _id: '123456abc', allFields: true } ]
 */
tfmRouter.route('/deals/:id/facilities')
  .get(
    tfmGetFacilitiesController.findFacilitiesGet,
  );

/**
 * @openapi
 * /tfm/facilities:
 *   get:
 *     summary: Get TFM facilities
 *     tags: [TFM]
 *     description: Get all facilities from TFM
 *     requestBody:
 *       description: Search based on specific string - ukefFacilityId & companyName
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               queryParams:
 *                 type: object
 *                 properties:
 *                   searchString:
 *                     type: string
 *                     example: HSBC bank
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               facilities: [ { tfmFacilities: { dealId: '61e54dd5b578247e14575882', facilityId: '1234', dealType: 'GEF' } } ]
 */
tfmRouter.route('/facilities').get(tfmGetFacilitiesController.getAllFacilities);

/**
 * @openapi
 * /tfm/facilities/:id:
 *   get:
 *     summary: Get a TFM facility by ID
 *     tags: [TFM]
 *     description: Get a TFM facility by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Facility ID to get
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/TFMFacilityGEF'
 *       404:
 *         description: Not found
 */
tfmRouter.route('/facilities/:id')
  .get(
    tfmGetFacilityController.findOneFacilityGet,
  );

/**
 * @openapi
 * /tfm/facilities/:id:
 *   put:
 *     summary: Update a TFM facility
 *     tags: [TFM]
 *     description: Update a TFM facility. Only updates facility.tfm, not facility.facilitySnapshot
 *     requestBody:
 *       description: Fields required to update a facility
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               facilityUpdate:
 *                 type: string
 *             example:
 *               facilityUpdate: { aNewField: true }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/TFMFacilityGEF'
 *                 - type: object
 *                   properties:
 *                     facilitySnapshot:
 *                       type: object
 *                       properties:
 *                         aNewField:
 *                           example: true
 *       404:
 *         description: Not found
 */
tfmRouter.route('/facilities/:id').put(
  tfmUpdateFacilityController.updateFacilityPut,
);

/**
 * @openapi
 * /tfm/facilities/:id/amendments:
 *   get:
 *     summary: Finds full amendment object for facility-id
 *     tags: [TFM, Amendments]
 *     description: Finds full amendment object for facility-id including status and full history array
 *     requestBody:
 *       description: Fields required to update a facility
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               facilityUpdate:
 *                 type: string
 *             example:
 *               facilityUpdate: { aNewField: true }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                {
 *                 status: 'In progress',
 *                 history: []
 *               }
 *       404:
 *         description: Not found
 */
tfmRouter.route('/facilities/:id/amendments')
  .get(
    tfmGetFacilityAmendmentsController.findFacilityAmendmentsGet,
  );

/**
 * @openapi
 * /tfm/facilities/:id/amendments:
 *   put:
 *     summary: Creates new amendment object and changes status
 *     tags: [TFM, Amendments]
 *     description: Adds new amendment object in history and changes status
 *     requestBody:
 *       description: Fields required to create amendment
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               amendment:
 *                 type: object
 *               id:
 *                 type: string
 *             example:
 *               status: 'In-progress'
 *               _id: 12345
 *               amendmentObj: {
 *                requestDate: 1555662,
 *                creationTimestamp: 1555662,
 *                createdBy: user
 *              }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                {
 *                 updated
 *                 createdAmendment
 *               }
*       404:
*         description: Not found
*/
tfmRouter.route('/facilities/:id/amendments').put(
  tfmUpdateFacilityAmendmentsController.updateFacilityAmendmentsCreate,
);

/**
* @openapi
* /tfm/facilities/amendments/:id:
*
*       404:
*         description: Not found
*/
tfmRouter.route('/facilities/:id/amendments/:amendmentId').put(
  tfmUpdateFacilityAmendmentsController.updateFacilityAmendmentsPut,
);

/**
 * @openapi
 * /tfm/teams:
 *   get:
 *     summary: Get all teams
 *     tags: [TFM]
 *     description: Get all teams
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/TFMTeams'
 */
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
