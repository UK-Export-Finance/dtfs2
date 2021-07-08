const express = require('express');

const tfmRouter = express.Router();

const tfmGetDealController = require('../controllers/tfm/deal/tfm-get-deal.controller');
const tfmGetDealsController = require('../controllers/tfm/deal/tfm-get-deals.controller');
const tfmUpdateDealController = require('../controllers/tfm/deal/tfm-update-deal.controller');
const tfmDeleteDealController = require('../controllers/tfm/deal/tfm-delete-deal.controller');
const tfmSubmitDealController = require('../controllers/tfm/deal/tfm-submit-deal.controller');
const tfmUpdateDealStageController = require('../controllers/tfm/deal/tfm-update-deal-stage.controller');
const tfmGetFacilityController = require('../controllers/tfm/facility/tfm-get-facility.controller');
const tfmUpdateFacilityController = require('../controllers/tfm/facility/tfm-update-facility.controller');

const tfmTeamsController = require('../controllers/tfm/users/tfm-teams.controller');
const tfmUsersController = require('../controllers/tfm/users/tfm-users.controller');

const { TFM_ROUTE } = require('../../constants/routes');

tfmRouter.use((req, res, next) => {
  req.routePath = TFM_ROUTE;
  next();
});

tfmRouter.route('/deals/:id')
  .get(
    tfmGetDealController.findOneDealGet,
  )
  .put(
    tfmUpdateDealController.updateDealPut,
  )
  .delete(
    tfmDeleteDealController.deleteDeal,
  );

tfmRouter.route('/deals/:id/submit')
  .put(
    tfmSubmitDealController.submitDealPut,
  );

tfmRouter.route('/deals/:id/snapshot')
  .put(
    tfmUpdateDealController.updateDealSnapshotPut,
  );

tfmRouter.route('/deals/:id/stage')
  .put(
    tfmUpdateDealStageController.updateDealStagePut,
  );

tfmRouter.route('/deals')
  .get(
    tfmGetDealsController.findDealsGet,
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
