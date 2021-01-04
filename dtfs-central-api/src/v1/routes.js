const express = require('express');

const openRouter = express.Router();
const dealController = require('./controllers/deal.controller');
const updateDealController = require('./controllers/update-deal.controller');
const deleteDealController = require('./controllers/delete-deal.controller');

openRouter.route('/deals')
  .post(
    dealController.createDealPost,
  );

openRouter.route('/deals/:id')
  .get(
    dealController.findOneDealGet,
  )
  .put(
    updateDealController.updateDealPut,
  )
  .delete(
    deleteDealController.deleteDeal,
  );

openRouter.route('/deals/query')
  .post(
    dealController.queryDealsPost,
  );

module.exports = { openRouter };
