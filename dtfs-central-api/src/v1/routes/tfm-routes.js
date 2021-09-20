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
 *             example:
 *               _id: 123abc
 *               dealSnapshot:
 *                 _id: 123abc
 *                 dealType: BSS/EWCS
 *                 status: Submitted
 *                 submissionCount: 1
 *                 facilities: [{ _id: '123', type: 'CONTINGENT'}, { _id: '456', type: 'CASH' }]
 *               tfm:
 *                 product: GEF
 *                 dateReceived: 16-09-2021
 *                 stage: Confirmed
 *                 exporterCreditRating: Acceptable (B+)
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
*             example:
*               _id: 123abc
*               dealSnapshot:
*                 _id: 123abc
*                 dealType: GEF
*                 facilities: [{ _id: '123', type: 'CONTINGENT'}, { _id: '456', type: 'CASH' }]
*               tfm:
*                 product: GEF
*                 dateReceived: 16-09-2021
*                 stage: Confirmed
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
*             example:
*               _id: 123abc
*               dealSnapshot:
*                 _id: 123abc
*                 dealType: BSS/EWCS
*               tfm:
*                 product: GEF
*                 dateReceived: 16-09-2021
*                 stage: Confirmed
*                 lossGivenDefault: 50
*                 exporterCreditRating: Good (BB-)
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
 *               aChangedField: 'new value'
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
 *                 aNewField: true
 *                 aChangedField: 'new value'
 *               tfm:
 *                 product: GEF
 *                 dateReceived: 16-09-2021
 *                 stage: Confirmed
 *                 exporterCreditRating: Acceptable (B+)
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

// User routes for mock teams & users
tfmRouter.route('/teams')
  .get(
    tfmTeamsController.listTeamsGET,
  )
  .post(
    tfmTeamsController.createTeamPOST,
  );

tfmRouter.route('/teams/:id')
  .get(
    tfmTeamsController.findOneTeamGET,
  )
  .delete(
    tfmTeamsController.deleteTeamDELETE,
  );

// User routes for mock teams & users
tfmRouter.route('/users')
  .get(
    tfmUsersController.listUsersGET,
  )
  .post(
    tfmUsersController.createUserPOST,
  );

tfmRouter.route('/users/:username')
  .get(
    tfmUsersController.findOneUserGET,
  )
  .delete(
    tfmUsersController.deleteUserDELETE,
  );

tfmRouter.route('/users/id/:userId')
  .get(
    tfmUsersController.findOneUserByIdGET,
  );

tfmRouter.route('/users/team/:teamId')
  .get(
    tfmUsersController.findTeamUsersGET,
  );

module.exports = tfmRouter;
