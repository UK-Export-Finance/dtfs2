const express = require('express');

const openRouter = express.Router();

const dealInit = require('./controllers/deal.submit.controller');

openRouter.route('/deals/:dealId/submit')
  .get(
    dealInit.submitDealGET,
  );

module.exports = { openRouter };
