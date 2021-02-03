const express = require('express');

const openRouter = express.Router();

const dealSubmit = require('./controllers/deal.submit.controller');

openRouter.route('/deals/submit')
  .put(
    dealSubmit.submitDealPUT,
  );

module.exports = { openRouter };
