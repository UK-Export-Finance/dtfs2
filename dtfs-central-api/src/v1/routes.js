const express = require('express');

const openRouter = express.Router();
const createDealController = require('./controllers/create-deal.controller');
const getDealController = require('./controllers/get-deal.controller');
const updateDealController = require('./controllers/update-deal.controller');
const deleteDealController = require('./controllers/delete-deal.controller');

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

module.exports = { openRouter };
