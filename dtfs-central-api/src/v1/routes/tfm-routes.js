const express = require('express');

const tfmRouter = express.Router();

const tfmGetDealController = require('../controllers/tfm/deal/tfm-get-deal.controller');
const tfmUpdateDealController = require('../controllers/tfm/deal/tfm-update-deal.controller');
const tfmSubmitDealController = require('../controllers/tfm/deal/tfm-submit-deal.controller');
const tfmGetFacilityController = require('../controllers/tfm/facility/tfm-get-facility.controller');
const tfmUpdateFacilityController = require('../controllers/tfm/facility/tfm-update-facility.controller');

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


tfmRouter.route('/facilities/:id')
  .get(
    tfmGetFacilityController.findOneFacilityGet,
  )
  .put(
    tfmUpdateFacilityController.updateFacilityPut,
  );

module.exports = tfmRouter;
