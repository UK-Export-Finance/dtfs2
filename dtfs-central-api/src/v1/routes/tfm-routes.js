const express = require('express');

const tfmRouter = express.Router();

const tfmGetDealController = require('../controllers/tfm/deal/tfm-get-deal.controller');
const tfmUpdateDealController = require('../controllers/tfm/deal/tfm-update-deal.controller');
const tfmSubmitDealController = require('../controllers/tfm/deal/tfm-submit-deal.controller');


const createFacilityController = require('../controllers/facility/create-facility.controller');
const getFacilityController = require('../controllers/facility/get-facility.controller');
const updateFacilityController = require('../controllers/facility/update-facility.controller');
const deleteFacilityController = require('../controllers/facility/delete-facility.controller');

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
  );

tfmRouter.route('/deals/:id/submit')
  .put(
    tfmSubmitDealController.submitDealPut,
  );

tfmRouter.route('/facilities')
  .post(
    createFacilityController.createFacilityPost,
  );

tfmRouter.route('/facilities/:id')
  .get(
    getFacilityController.findOneFacilityGet,
  )
  .put(
    updateFacilityController.updateFacilityPut,
  )
  .delete(
    deleteFacilityController.deleteFacility,
  );

module.exports = tfmRouter;
