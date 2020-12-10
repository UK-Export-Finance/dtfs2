const express = require('express');

const openRouter = express.Router();
const deal = require('./controllers/deal.controller');

openRouter.route('/deals/:id')
  .get(
    deal.findOneDealGet,
  );

openRouter.route('/deals/query')
  .post(
    deal.queryDealsPost,
  );

module.exports = { openRouter };
