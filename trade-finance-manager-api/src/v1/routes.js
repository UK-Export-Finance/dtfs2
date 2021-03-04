const express = require('express');

const openRouter = express.Router();

const dealSubmit = require('./controllers/deal.submit.controller');
const userController = require('./controllers/user.controller');

openRouter.route('/deals/submit')
  .put(
    dealSubmit.submitDealPUT,
  );

// Mock user routes. Not required once active directory login is enabled
openRouter.route('/users/:username')
  .get(
    userController.findUserGET,
  );
module.exports = { openRouter };
