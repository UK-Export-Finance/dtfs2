const express = require('express');

const tfmRouter = express.Router();

const getDealController = require('../controllers/portal/deal/get-deal.controller');
const updateDealController = require('../controllers/portal/deal/update-deal.controller');
const deleteDealController = require('../controllers/portal/deal/delete-deal.controller');

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
    getDealController.findOneDealGet,
  )
  .put(
    updateDealController.updateDealPut,
  )
  .delete(
    deleteDealController.deleteDeal,
  );

tfmRouter.route('/deals/query')
  .post(
    getDealController.queryDealsPost,
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
