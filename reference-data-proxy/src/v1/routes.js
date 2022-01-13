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
const eStore = require('./controllers/estore.controller');
const premiumSchedule = require('./controllers/premium-schedule.controller');
const email = require('./controllers/email.controller');

/**
 * @openapi
 * /countries:
 *   get:
 *     summary: Get all countries
 *     tags: [Countries, Local Data]
 *     description: Get all countries - sorted alphabetically. Stored locally
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Countries'
 */
openRouter.route('/countries')
  .get(
    countries.findAll,
  );

/**
 * @openapi
 * /countries/:code:
 *   get:
 *     summary: Get a country by country code
 *     tags: [Countries, Local Data]
 *     description: Get a country by country code. Stored locally
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *           example: GBR
 *         required: true
 *         description: Country code
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Country'
 *       404:
 *         description: Not found
 */
openRouter.route('/countries/:code')
  .get(
    countries.findOne,
  );

/**
 * @openapi
 * /currencies:
 *   get:
 *     summary: Get all currencies
 *     tags: [Currencies, Local Data]
 *     description: Get all currencies - sorted alphabetically. Stored locally
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Currencies'
 */
openRouter.route('/currencies')
  .get(
    currencies.findAll,
  );

/**
 * @openapi
 * /currencies/:code:
 *   get:
 *     summary: Get a currency by currency code
 *     tags: [Currencies, Local Data]
 *     description: Get a currency by currency code. Stored locally
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *           example: GBP
 *         required: true
 *         description: Currency code
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Currency'
 *       404:
 *         description: Not found
 */
openRouter.route('/currencies/:id')
  .get(
    currencies.findOne,
  );

/**
 * @openapi
 * /industry-sectors:
 *   get:
 *     summary: Get all industry sectors and classes
 *     tags: [Industry Sectors, Local Data]
 *     description: Get all industry sectors and classes - sorted alphabetically. Stored locally
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/IndustrySectors'
 */
openRouter.route('/industry-sectors')
  .get(
    industrySectors.findAll,
  );

/**
 * @openapi
 * /industry-sectors/:code:
 *   get:
 *     summary: Get an industry sector and associated classes by sector code
 *     tags: [Industry Sectors, Local Data]
 *     description: Get an industry sector and associated classes by sector code. Stored locally
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *           example: '1008'
 *         required: true
 *         description: Industry Sector code
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/IndustrySector'
 *       404:
 *         description: Not found
 */
openRouter.route('/industry-sectors/:code')
  .get(
    industrySectors.findOne,
  );

/**
 * @openapi
 * /industry-sectors/:code/acbs-sector:
 *   get:
 *     summary: Get UKEF/ACBS industry sector and code
 *     tags: [Industry Sectors, ACBS, Mulesoft]
 *     description: Get UKEF/ACBS industry sector and code by our local sector code. ACBS has it's own industry codes
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *           example: '1008'
 *         required: true
 *         description: Industry Sector code from our local sector codes
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ACBSIndustrySector'
 *       404:
 *         description: Not found
 */
openRouter.route('/industry-sectors/:code/acbs-sector')
  .get(
    industrySectors.getACBSIndustrySector,
  );

/**
 * @openapi
 * /number-generator:
 *   post:
 *     summary: Calls Number Generator Azure Function/Orchestrator
 *     tags: [Number Generator]
 *     description: Calls Number Generator Azure Function/Orchestrator. Triggers API calls to Number Generator API.
 *     requestBody:
 *       required: true
 *       description: Deal, User and Entity fields required to call Number Generator API. Entity is deal or facility.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               dealType: BSS/EWCS
 *               entityType: deal
 *               entityId: abc123
 *               dealId: def456
 *               user: { _id: 1234abc }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ukefId:
 *                   type: string
 *                   example: 'PENDING'
 */
openRouter.route('/number-generator')
  .post(
    numberGenerator.callNumberGeneratorPOST,
  );

/**
 * @openapi
 * /acbs:
 *   post:
 *     summary: Calls ACBS Azure Function / Orchestrator
 *     tags: [ACBS, Mulesoft]
 *     description: Calls ACBS Azure Function / Orchestrator. Triggers API calls to ACBS API.
 *     requestBody:
 *       required: true
 *       description: Fields to be consumed consumed/mapped in the Azure Functin
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/ACBSCreateRecordRequestBody'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ACBSCreateRecordResponseBody'
 */
openRouter.route('/acbs')
  .post(
    acbs.createAcbsRecordPOST,
  );

/**
 * @openapi
 * /acbs/:entityType/:id:
 *   get:
 *     summary: Check if an ID from Number Generator API is being used
 *     tags: [ACBS, Mulesoft]
 *     description: If a 404 is returned, the ID is not in use and is OK to use
 *     parameters:
 *       - in: path
 *         name: entityType
 *         schema:
 *           type: string
 *           example: deal
 *         required: true
 *         description: deal or facility
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           example: '20010739'
 *         required: true
 *         description: ID to check (this comes from Number Generator API)
 *     responses:
 *       200:
 *         description: Found. ID is in use and cannot be used
 *       404:
 *         description: Not found. ID is not in use and can be used
 */
openRouter.route('/acbs/:entityType/:id')
  .get(
    acbs.findOne,
  );

/**
 * @openapi
 * /acbs/facility/:id/issue:
 *   post:
 *     summary: Mark a facility as issued in ACBS. Calls Azure Function / Orchestrator
 *     tags: [ACBS, Mulesoft]
 *     description: Calls ACBS Azure Function / Orchestrator. Triggers API calls to ACBS API.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           example: 123abc
 *         required: true
 *         description: facility ID
 *     requestBody:
 *       required: true
 *       description: Fields to be consumed consumed/mapped in the Azure Functin
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/ACBSIssueFacilityRequestBody'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ACBSIssueFacilityResponseBody'
 */
openRouter.route('/acbs/facility/:id/issue')
  .post(
    acbs.issueAcbsFacilityPOST,
  );

/**
 * @openapi
 * /party-db/:companyRegNo:
 *   get:
 *     summary: Get a UKEF party
 *     tags: [PartyDB, Mulesoft]
 *     description: We only consume the Party URN (Unique Reference Number). Not all fields are in the response example.
 *     parameters:
 *       - in: path
 *         name: companyRegNo
 *         schema:
 *           type: string
 *           example: '10686321'
 *         required: true
 *         description: Companies House Registration Number to get the UKEF Party
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/PartyDB'
 *       404:
 *         description: Not found
 */
openRouter.route('/party-db/:companyRegNo')
  .get(
    partyDb.lookup,
  );

/**
 * @openapi
 * /currency-exchange-rate/:source/:target:
 *   get:
 *     summary: Get the active exchange rate for the provided source and target currency codes
 *     tags: [Currency Exchange, Mulesoft]
 *     description: >-
 *       ISO 3 currency codes.
 *       Note - the Mulesoft API does not support XYZ to GBP conversion.
 *       To handle this scenario - behind the scenes in our controller, the source and target are reversed.
 *       In our response handler, we only return the midPrice field.
 *     parameters:
 *       - in: path
 *         name: source
 *         schema:
 *           type: string
 *           example: EUR
 *         required: true
 *         description: Currency Code to exchange from
 *       - in: path
 *         name: target
 *         schema:
 *           type: string
 *           example: USD
 *         required: true
 *         description: Currency Code to exchange to
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/CurrencyExchangeRate'
 *       404:
 *         description: Not found
 */
openRouter.route('/currency-exchange-rate/:source/:target')
  .get(
    currencyExchangeRate.getExchangeRate,
  );

/**
 * @openapi
 * /exposure-period/:startDate/:endDate/:facilityType:
 *   get:
 *     summary: Get the exposure period in months for a facility
 *     tags: [Exposure Period, Mulesoft]
 *     description: Get the exposure period in months for a facility
 *     parameters:
 *       - in: path
 *         name: startDate
 *         schema:
 *           type: string
 *           example: '2017-07-04'
 *         required: true
 *         description: Exposure period/Cover start date
 *       - in: path
 *         name: endDate
 *         schema:
 *           type: string
 *           example: '2018-07-04'
 *         required: true
 *         description: Exposure period/Cover end date
 *       - in: path
 *         name: facilityType
 *         schema:
 *           type: string
 *           example: Bond
 *         required: true
 *         description: Type of facility - Bond/Loan/Cash/Contingent
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example: { exposurePeriodInMonths: 12 }
 */
openRouter.route('/exposure-period/:startDate/:endDate/:facilityType')
  .get(
    exposurePeriod.getExposurePeriod,
  );

/**
 * @openapi
 * /premium-schedule:
 *   get:
 *     summary: Get a repayment schedule for a facility
 *     tags: [Premium Schedule, Mulesoft]
 *     description: Get a repayment schedule for a facility
 *     requestBody:
 *       required: true
 *       description: Facility fields
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/PremiumScheduleRequestBody'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/PremiumScheduleResponseBody'
 */
openRouter.route('/premium-schedule')
  .get(
    premiumSchedule.getPremiumSchedule,
  );

/**
 * @openapi
 * /companies-house/:companyRegNo:
 *   get:
 *     summary: Get Company profile from Companies House API
 *     tags: [Companies House]
 *     description: >-
 *       Get Company profile from Companies House API.
 *       Note - Not all fields are in the response body example. See Companies House API documentation.
 *     parameters:
 *       - in: path
 *         name: companyRegNo
 *         schema:
 *           type: string
 *           example: UKEF0001
 *         required: true
 *         description: Company registration number
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/CompaniesHouseResponseBody'
 */
openRouter.route('/companies-house/:companyRegNo')
  .get(
    companiesHouse.lookup,
  );

/**
 * @openapi
 * /ordnance-survey/:postcode:
 *   get:
 *     summary: Get a list of addresses from Ordnance Survey API
 *     tags: [Ordnance Survey]
 *     description: >-
 *       Get a list of addresses from Ordnance Survey API.
 *       Note - Not all fields are in the response body example. See Ordnance Survey API documentation.
 *     parameters:
 *       - in: path
 *         name: postcode
 *         schema:
 *           type: string
 *           example: SW1A2JR
 *         required: true
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/OrdnanceSurveyResponseBody'
 */
openRouter.route('/ordnance-survey/:postcode')
  .get(
    ordnanceSurvey.lookup,
  );

/**
 * @openapi
 * /estore:
 *   get:
 *     summary: Create Estore folders
 *     tags: [Estore, Mulesoft]
 *     description: Creates an Estore site and then folders for buyer, deal and facilities. Multiple API calls.
 *     requestBody:
 *       required: true
 *       description: Fields required for each Estore API call
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/EstoreRequestBody'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/EstoreResponseBody'
 */
openRouter.route('/estore/')
  .post(
    eStore.createEstore,
  );

/**
 * @openapi
 * /email:
 *   post:
 *     summary: Send an email
 *     tags: [Notify]
 *     description: Send an email with GOV.UK Notify API
 *     requestBody:
 *       required: true
 *       description: Deal, User and Entity fields required to call Number Generator API. Entity is deal or facility.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               templateId: e98df53c-0645-49b4-b87e-ac6d9b6ee357
 *               sendToEmailAddress: hello@world.com
 *               emailVariables: { status: Approved }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/NotifyResponseBody'
 */
openRouter.route('/email')
  .post(
    email.sendEmail,
  );

module.exports = { openRouter };
