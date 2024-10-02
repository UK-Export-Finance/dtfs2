const express = require('express');

const tfmRouter = express.Router();

const { validateDealCancellationEnabled } = require('@ukef/dtfs2-common');
const {
  validatePutFacilityAmendmentPayload,
  validatePostFacilityAmendmentPayload,
  validatePutDealCancellationPayload,
  validateDeleteDealCancellationPayload,
} = require('./middleware/payload-validation');
const validation = require('../validation/route-validators/route-validators');
const handleExpressValidatorResult = require('../validation/route-validators/express-validator-result-handler');

const tfmGetDealController = require('../controllers/tfm/deal/tfm-get-deal.controller');
const tfmGetDealsController = require('../controllers/tfm/deal/tfm-get-deals.controller');
const tfmUpdateDealController = require('../controllers/tfm/deal/tfm-update-deal.controller');
const tfmDeleteDealController = require('../controllers/tfm/deal/tfm-delete-deal.controller');
const tfmSubmitDealController = require('../controllers/tfm/deal/tfm-submit-deal.controller');
const tfmGetFacilitiesController = require('../controllers/tfm/facility/tfm-get-facilities.controller');
const tfmGetFacilityController = require('../controllers/tfm/facility/tfm-get-facility.controller');
const tfmUpdateFacilityController = require('../controllers/tfm/facility/tfm-update-facility.controller');
const tfmGetAmendmentController = require('../controllers/tfm/amendments/tfm-get-amendments.controller');
const tfmPutAmendmentController = require('../controllers/tfm/amendments/tfm-put-amendments.controller');
const tfmPostAmendmentController = require('../controllers/tfm/amendments/tfm-post-amendments.controller');
const tfmPutUpdateDealCancellationController = require('../controllers/tfm/deal-cancellation/tfm-put-update-deal-cancellation.controller');
const tfmGetDealCancellationController = require('../controllers/tfm/deal-cancellation/tfm-get-deal-cancellation.controller');
const tfmDeleteDealCancellationController = require('../controllers/tfm/deal-cancellation/tfm-delete-deal-cancellation.controller');

const tfmTeamsController = require('../controllers/tfm/users/tfm-teams.controller');
const tfmUsersController = require('../controllers/tfm/users/tfm-users.controller');

const { ROUTES } = require('../../constants');

tfmRouter.use((req, res, next) => {
  req.routePath = ROUTES.TFM_ROUTE;
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
tfmRouter.route('/deals/submit').put(tfmSubmitDealController.submitDealPut);

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
tfmRouter.route('/deals/:id').get(tfmGetDealController.findOneDealGet);

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
tfmRouter.route('/deals/:id').put(tfmUpdateDealController.updateDealPut);

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
tfmRouter.route('/deals/:id').delete(tfmDeleteDealController.deleteDeal);

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
 *             properties:
 *               auditDetails:
 *                 type: object
 *                 $ref: '#/definitions/portalAuditDetails'
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
tfmRouter.route('/deals/:id/snapshot').put(tfmUpdateDealController.updateDealSnapshotPut);

/**
 * @openapi
 * /tfm/deals:
 *   get:
 *     summary: Get TFM deals
 *     tags: [TFM]
 *     description: Get TFM deals
 *     parameters:
 *       - in: query
 *         name: searchString
 *         schema:
 *           type: string
 *         description: A search term to filter the deals table by
 *       - in: query
 *         name: byField
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: tfm.dateReceived
 *               value:
 *                 example: 25-12-2021
 *         description: An array. Each item in the array contains the name and value of a field to filter the deals table by
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: object
 *           properties:
 *             order:
 *               type: string
 *               example: ascending
 *             field:
 *               type: string
 *               example: dealSnapshot.ukefDealId
 *         description: A field and order to sort the deals table by
 *       - in: query
 *         name: pagesize
 *         schema:
 *           type: number
 *           example: 20
 *         description: The number of deals per table page
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           example: 0
 *         description: The requested page number of the deals table
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deals:
 *                   type: array
 *                   items:
 *                     $ref: '#/definitions/TFMDealBSS'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: number
 *                       example: 2168
 *                     currentPage:
 *                       type: number
 *                       example: 108
 *                     totalPages:
 *                       type: number
 *                       example: 109
 */
tfmRouter.route('/deals').get(tfmGetDealsController.findDealsGet);

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
tfmRouter
  .route('/deals/:id/facilities')
  .get(validation.mongoIdValidation('id'), handleExpressValidatorResult, tfmGetFacilitiesController.getFacilitiesByDealId);

/**
 * @openapi
 * /tfm/facilities:
 *   get:
 *     summary: Get TFM facilities
 *     tags: [TFM]
 *     description: Get all facilities from TFM
 *     parameters:
 *       - in: query
 *         name: searchString
 *         schema:
 *           type: string
 *         description: A search term to filter the facilities table by
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: object
 *           properties:
 *             order:
 *               type: string
 *               example: ascending
 *             field:
 *               type: string
 *               example: ukefFacilityId
 *         description: A field and order to sort the facilities table by
 *       - in: query
 *         name: pagesize
 *         schema:
 *           type: number
 *           example: 20
 *         description: The number of facilities per table page
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           example: 0
 *         description: The requested page number of the facilities table
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
 *               auditDetails:
 *                 type: object
 *                 $ref: '#/definitions/systemPortalOrTfmAuditDetails'
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
 *                     tfmUpdate:
 *                       type: object
 *                       properties:
 *                         aNewField:
 *                           example: true
 *       404:
 *         description: Not found
 */
tfmRouter
  .route('/facilities/:id')
  .all(validation.mongoIdValidation('id'), handleExpressValidatorResult)
  .get(tfmGetFacilityController.findOneFacilityGet)
  .put(tfmUpdateFacilityController.updateFacilityPut);

/**
 * @openapi
 * /tfm/facilities/:facilityId/amendments:
 *   get:
 *     summary: Finds full amendment object for facility-id
 *     tags: [TFM, Amendments]
 *     description: Finds full amendment object for facility-id
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
 *                 status: 'In progress'
 *               }
 *       404:
 *         description: Not found
 */
tfmRouter.route('/amendments').get(tfmGetAmendmentController.getAllAmendmentsInProgress);
tfmRouter
  .route('/facilities/:facilityId/amendments/:amendmentIdOrStatus?/:type?')
  .get(validation.mongoIdValidation('facilityId'), handleExpressValidatorResult, tfmGetAmendmentController.getAmendmentsByFacilityId);
tfmRouter
  .route('/deals/:dealId/amendments/:status?/:type?')
  .get(validation.mongoIdValidation('dealId'), handleExpressValidatorResult, tfmGetAmendmentController.getAmendmentsByDealId);

/**
 * @openapi
 * /tfm/facilities/:facilityId/amendments:
 *   post:
 *     summary: Creates new amendment object and changes status
 *     tags: [TFM, Amendments]
 *     description: Adds new amendment object in amendments array
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
 *                 example:
 *                  {
 *                    requestDate: 1555662,
 *                    creationTimestamp: 1555662,
 *                    createdBy: user
 *                  }
 *               id:
 *                 type: string
 *               auditDetails:
 *                 type: object
 *                 $ref: '#/definitions/tfmAuditDetails'
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
tfmRouter
  .route('/facilities/:facilityId/amendments')
  .post(
    validation.mongoIdValidation('facilityId'),
    handleExpressValidatorResult,
    validatePostFacilityAmendmentPayload,
    tfmPostAmendmentController.postTfmAmendment,
  );

/**
 * @openapi
 * /tfm/facilities/amendments/:id:
 *
 *       404:
 *         description: Not found
 */
tfmRouter
  .route('/facilities/:facilityId/amendments/:amendmentId')
  .put(
    validation.mongoIdValidation('facilityId'),
    validation.mongoIdValidation('amendmentId'),
    handleExpressValidatorResult,
    validatePutFacilityAmendmentPayload,
    tfmPutAmendmentController.updateTfmAmendment,
  );

/**
 * @openapi
 * /tfm/deals/:id/cancellation:
 *   put:
 *     summary: Updates tfm deal cancellation object on MIN and AIN deal types
 *     tags: [TFM, deals, cancellation, data fix]
 *     description: Updates cancellation object on the deals tfm object
 *     parameters:
 *       - in: path
 *         name: dealId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the deal to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *               bankRequestDate:
 *                 type: number
 *                 example: 1725977352
 *               effectiveFrom:
 *                 type: number
 *                 example: 1725977352
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *   get:
 *     summary: Get tfm deal cancellation object on MIN and AIN deal types
 *     tags: [TFM, deals, cancellation, data fix]
 *     description: Get cancellation object on the deals tfm object
 *     parameters:
 *       - in: path
 *         name: dealId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the deal to update
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete tfm deal cancellation object on MIN and AIN deal types
 *     tags: [TFM, deals, cancellation, data fix]
 *     description: Delete cancellation object on the deals tfm object
 *     parameters:
 *       - in: path
 *         name: dealId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the deal to update
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
tfmRouter
  .route('/deals/:dealId/cancellation')
  .all(validateDealCancellationEnabled, validation.mongoIdValidation('dealId'), handleExpressValidatorResult)
  .put(validatePutDealCancellationPayload, tfmPutUpdateDealCancellationController.updateTfmDealCancellation)
  .get(tfmGetDealCancellationController.getTfmDealCancellation)
  .delete(validateDeleteDealCancellationPayload, tfmDeleteDealCancellationController.deleteTfmDealCancellation);

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
tfmRouter.route('/teams').get(tfmTeamsController.listTfmTeam);

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
 *             team:
 *               type: object
 *               $ref: '#/definitions/TFMTeam'
 *             auditDetails:
 *               type: object
 *               $ref: '#/definitions/tfmAuditDetails'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: '123456abc'
 */
tfmRouter.route('/teams').post(tfmTeamsController.createTfmTeam);

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
tfmRouter.route('/teams/:id').get(tfmTeamsController.findOneTfmTeam);

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
tfmRouter.route('/teams/:id').delete(tfmTeamsController.deleteTfmTeam);

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
tfmRouter.route('/users').get(tfmUsersController.listTfmUser);

/**
 * @openapi
 * /tfm/users:
 *   post:
 *     deprecated: true
 *     summary: Create a user in tfm-users collection
 *     tags: [TFM]
 *     description: Create a users in tfm-users collection
 *     requestBody:
 *       description: Fields required to create a user. No validation in place.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             user:
 *               type: object
 *               $ref: '#/definitions/TFMUser'
 *             auditDetails:
 *               type: object
 *               $ref: '#/definitions/tfmAuditDetails'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: '123456abc'
 */
tfmRouter.route('/users').post(tfmUsersController.createTfmUser);

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
tfmRouter.route('/users/:username').get(tfmUsersController.findOneTfmUser);

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
tfmRouter.route('/users/:username').delete(tfmUsersController.deleteTfmUser);

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
tfmRouter.route('/users/id/:userId').get(tfmUsersController.findOneTfmUserById);

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
tfmRouter.route('/users/team/:teamId').get(tfmUsersController.findTfmTeamUser);

module.exports = tfmRouter;
