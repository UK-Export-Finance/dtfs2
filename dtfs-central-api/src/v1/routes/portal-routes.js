const express = require('express');

const portalRouter = express.Router();
const createDealController = require('../controllers/portal/deal/create-deal.controller');
const getDealController = require('../controllers/portal/deal/get-deal.controller');
const updateDealController = require('../controllers/portal/deal/update-deal.controller');
const updateDealStatusController = require('../controllers/portal/deal/update-deal-status.controller');
const deleteDealController = require('../controllers/portal/deal/delete-deal.controller');
const addDealController = require('../controllers/portal/deal/add-deal-comment.controller');

const createFacilityController = require('../controllers/portal/facility/create-facility.controller');
const createMultipleFacilitiesController = require('../controllers/portal/facility/create-multiple-facilities.controller');
const getFacilityController = require('../controllers/portal/facility/get-facility.controller');
const getFacilitiesController = require('../controllers/portal/facility/get-facilities.controller');
const updateFacilityController = require('../controllers/portal/facility/update-facility.controller');
const deleteFacilityController = require('../controllers/portal/facility/delete-facility.controller');
const updateFacilityStatusController = require('../controllers/portal/facility/update-facility-status.controller');

const getBankController = require('../controllers/bank/get-bank.controller');
const createBankController = require('../controllers/bank/create-bank.controller');

const createGefDealController = require('../controllers/portal/gef-deal/create-gef-deal.controller');
const getGefDealController = require('../controllers/portal/gef-deal/get-gef-deal.controller');

const createGefExporterController = require('../controllers/portal/gef-exporter/create-gef-exporter.controller');
const getGefExporterController = require('../controllers/portal/gef-exporter/get-gef-exporter.controller');

const getGefFacilitiesController = require('../controllers/portal/gef-facility/get-facilities.controller');
const createGefFacilityController = require('../controllers/portal/gef-facility/create-gef-facility.controller');

const { PORTAL_ROUTE } = require('../../constants/routes');

portalRouter.use((req, res, next) => {
  req.routePath = PORTAL_ROUTE;
  next();
});

portalRouter.route('/banks')
  .post(
    createBankController.createBankPost,
  );

portalRouter.route('/banks/:id')
  .get(
    getBankController.findOneBankGet,
  );

portalRouter.route('/deals')
  .get(
    getDealController.queryAllDeals,
  )
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

portalRouter.route('/deals/:id/status')
  .put(
    updateDealStatusController.updateDealStatusPut,
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

portalRouter.route('/multiple-facilities')
  .post(
    createMultipleFacilitiesController.createMultipleFacilitiesPost,
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

portalRouter.route('/facilities/:id/status')
  .put(
    updateFacilityStatusController.updateFacilityStatusPut,
  );

portalRouter.route('/gef/deals')
  .post(
    createGefDealController.createDealPost,
  );

portalRouter.route('/gef/deals/:id')
  .get(
    getGefDealController.findOneDealGet,
  );

portalRouter.route('/gef/exporter')
  .post(
    createGefExporterController.createExporterPost,
  );

portalRouter.route('/gef/exporter/:id')
  .get(
    getGefExporterController.findOneExporterGet,
  );

portalRouter.route('/gef/deals/:id/facilities')
  .get(
    getGefFacilitiesController.findAllGet,
  );

portalRouter.route('/gef/facilities')
  .post(
    createGefFacilityController.createFacilityPost,
  );

module.exports = portalRouter;
