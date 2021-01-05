const express = require('express');

const openRouter = express.Router();
const createDealController = require('./controllers/deal/create-deal.controller');
const getDealController = require('./controllers/deal/get-deal.controller');
const updateDealController = require('./controllers/deal/update-deal.controller');
const deleteDealController = require('./controllers/deal/delete-deal.controller');

openRouter.route('/deals')
  .post(
    createDealController.createDealPost,
  );

openRouter.route('/deals/:id')
  .get(
    getDealController.findOneDealGet,
  )
  .put(
    updateDealController.updateDealPut,
  )
  .delete(
    deleteDealController.deleteDeal,
  );

openRouter.route('/deals/query')
  .post(
    getDealController.queryDealsPost,
  );


// openRouter.route('/facilities')
//   .post(
//     createFacilityController.createFacilityPost,
//   );

// openRouter.route('/facilities/:id')
//   .get(
//     getFacilityController.findOneFacilityGet,
//   )
//   .put(
//     updateFacilityController.updateFacilityPut,
//   )
//   .delete(
//     deleteFacilityController.deleteFacility,
//   );

 
module.exports = { openRouter };
