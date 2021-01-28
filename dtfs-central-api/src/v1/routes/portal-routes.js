const express = require('express');

const portalRouter = express.Router();
const createDealController = require('../controllers/portal/deal/create-deal.controller');
const getDealController = require('../controllers/portal/deal/get-deal.controller');
const updateDealController = require('../controllers/portal/deal/update-deal.controller');
const deleteDealController = require('../controllers/portal/deal/delete-deal.controller');
const addDealController = require('../controllers/portal/deal/add-deal-comment.controller');

const createFacilityController = require('../controllers/portal/facility/create-facility.controller');
const getFacilityController = require('../controllers/portal/facility/get-facility.controller');
const getFacilitiesController = require('../controllers/portal/facility/get-facilities.controller');
const updateFacilityController = require('../controllers/portal/facility/update-facility.controller');
const deleteFacilityController = require('../controllers/portal/facility/delete-facility.controller');

const { PORTAL_ROUTE } = require('../../constants/routes');

portalRouter.use((req, res, next) => {
  req.routePath = PORTAL_ROUTE;
  next();
});

portalRouter.route('/deals')
  .post(
    createDealController.createDealPost,
  );

portalRouter.route('/deals/:id')
  .get(
    getDealController.findOneDealGet,
  )
  .put(
    updateDealController.updateDealPut,
  )
  .delete(
    deleteDealController.deleteDeal,
  );

portalRouter.route('/deals/:id/comment')
  .post(
    addDealController.addDealCommentPost,
  );

portalRouter.route('/deals/query')
  .post(
    getDealController.queryDealsPost,
  );

portalRouter.route('/facilities')
  .get(
    getFacilitiesController.findAllGet,
  )
  .post(
    createFacilityController.createFacilityPost,
  );

portalRouter.route('/facilities/:id')
  .get(
    getFacilityController.findOneFacilityGet,
  )
  .put(
    updateFacilityController.updateFacilityPut,
  )
  .delete(
    deleteFacilityController.deleteFacility,
  );

module.exports = portalRouter;
