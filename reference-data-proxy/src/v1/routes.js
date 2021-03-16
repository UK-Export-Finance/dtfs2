const express = require('express');

const openRouter = express.Router();
const countries = require('./controllers/countries.controller');
const currencies = require('./controllers/currencies.controller');
const industrySectors = require('./controllers/industry-sectors.controller');
const numberGenerator = require('./controllers/number-generator.controller');
const partyDb = require('./controllers/party-db.controller');
const acbs = require('./controllers/acbs.controller');
const currencyExchangeRate = require('./controllers/currency-exchange-rate.controller');
const exposurePeriod = require('./controllers/exposure-period.controller');
const companiesHouse = require('./controllers/companies-house.controller');
const ordnanceSurvey = require('./controllers/ordnance-survey.controller');

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

openRouter.route('/industry-sectors')
  .get(
    industrySectors.findAll,
  );

openRouter.route('/industry-sectors/:code')
  .get(
    industrySectors.findOne,
  );

openRouter.route('/number-generator/:entityType')
  .get(
    numberGenerator.create,
  );

openRouter.route('/acbs/:entityType/:id')
  .get(
    acbs.findOne,
  );

openRouter.route('/party-db/:companyRegNo')
  .get(
    partyDb.lookup,
  );

openRouter.route('/currency-exchange-rate/:source/:target')
  .get(
    currencyExchangeRate.getExchangeRate,
  );

openRouter.route('/exposure-period/:startDate/:endDate/:facilityType')
  .get(
    exposurePeriod.getExposurePeriod,
  );

openRouter.route('/companies-house/:companyRegNo')
  .get(
    companiesHouse.lookup,
  );

openRouter.route('/ordnance-survey/:postcode')
  .get(
    ordnanceSurvey.lookup,
  );

module.exports = { openRouter };
