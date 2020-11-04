const express = require('express');

const openRouter = express.Router();
const countries = require('./controllers/countries.controller');
const currencies = require('./controllers/currencies.controller');

openRouter.route('/countries')
  .get(
    countries.findAll,
  );

openRouter.route('/countries/:code')
  .get(
    countries.findOne,
  );

openRouter.route('/currencies')
  .get(
    currencies.findAll,
  );

openRouter.route('/currencies/:id')
  .get(
    currencies.findOne,
  );


module.exports = { openRouter };
