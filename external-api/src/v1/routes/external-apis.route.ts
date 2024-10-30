/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';

import * as countries from '../controllers/countries.controller';
import * as currencies from '../controllers/currencies.controller';
import * as industrySectors from '../controllers/industry-sectors.controller';
import * as number from '../controllers/number-generator.controller';
import * as partyDb from '../controllers/party-db.controller';
import * as partyUrn from '../controllers/party-urn.controller';
import * as acbs from '../controllers/acbs.controller';
import * as currencyExchangeRate from '../controllers/currency-exchange-rate.controller';
import * as exposurePeriod from '../controllers/exposure-period.controller';
import * as companies from '../controllers/companies.controller';
import * as geospatialAddresses from '../controllers/geospatial-addresses.controller';
import * as eStore from '../controllers/estore/eStore.controller';
import * as premiumSchedule from '../controllers/premium-schedule.controller';
import * as email from '../controllers/email.controller';
import * as bankHolidays from '../controllers/bank-holidays.controller';

export const apiRoutes = express.Router();

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
apiRoutes.get('/countries', countries.findAll);

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
apiRoutes.get('/countries/:code', countries.findOne);

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
apiRoutes.get('/currencies', currencies.findAll);

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
apiRoutes.get('/currencies/:id', currencies.findOne);

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
apiRoutes.get('/industry-sectors', industrySectors.findAll);

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
apiRoutes.get('/industry-sectors/:code', industrySectors.findOne);

/**
 * @openapi
 * /industry-sectors/:code/acbs-sector:
 *   get:
 *     summary: Get UKEF/ACBS industry sector and code
 *     tags: [Industry Sectors, ACBS, APIM]
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
apiRoutes.get('/industry-sectors/:code/acbs-sector', industrySectors.getACBSIndustrySector);

/**
 * @openapi
 * /number-generator:
 *   post:
 *     summary: Calls Number Generator APIM MDM API
 *     tags: [Number Generator, APIM]
 *     description: Endpoint is responsible for getting a number from the number-generator via APIM MDM
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
apiRoutes.post('/number-generator', number.getNumber);

/**
 * @openapi
 * /acbs:
 *   post:
 *     summary: Calls ACBS Azure Function / Orchestrator
 *     tags: [ACBS, APIM]
 *     description: Calls ACBS Azure Function / Orchestrator. Triggers API calls to ACBS API.
 *     requestBody:
 *       required: true
 *       description: Fields to be consumed consumed/mapped in the Azure Function
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
apiRoutes.post('/acbs', acbs.createAcbsRecordPOST);

/**
 * @openapi
 * /acbs/:entityType/:id:
 *   get:
 *     summary: Check if an ID from Number Generator API is being used
 *     tags: [ACBS, APIM]
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
apiRoutes.get('/acbs/:entityType/:id', acbs.findOne);

/**
 * @openapi
 * /acbs/facility/:id/issue:
 *   post:
 *     summary: Mark a facility as issued in ACBS. Calls Azure Function / Orchestrator
 *     tags: [ACBS, APIM]
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
 *       description: Fields to be consumed or mapped in the Azure DOF.
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
apiRoutes.post('/acbs/facility/:id/issue', acbs.issueAcbsFacilityPOST);

/**
 * @openapi
 * /acbs/facility/:id/amendments:
 *   post:
 *     summary: Amend's ACBS facility records. Facility properties are updated as per payload.
 *     tags: [ACBS, APIM]
 *     description: Azure DOF `acbs-amend-facility` is invoked.
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
 *       description: Fields to be consumed or mapped in the Azure DOF.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/ACBSAmendFacilityRequestBody'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ACBSAmendFacilityResponseBody'
 */
apiRoutes.post('/acbs/facility/:id/amendments', acbs.amendAcbsFacilityPost);

/**
 * @openapi
 * /party-db/:partyDbCompanyRegistrationNumber:
 *   get:
 *     summary: Get a UKEF party
 *     tags: [APIM, Salesforce]
 *     description: We only consume the Party URN (Unique Reference Number). Not all fields are in the response example.
 *     parameters:
 *       - in: path
 *         name: partyDbCompanyRegistrationNumber
 *         schema:
 *           type: string
 *           example: '1234'
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
apiRoutes.get('/party-db/:partyDbCompanyRegistrationNumber', partyDb.lookup);

/**
 * @openapi
 * /party-db/:partyDbCompanyRegistrationNumber:
 *   post:
 *     summary: Create a new UKEF party
 *     tags: [APIM, Salesforce]
 *     description: We only consume the Companies House number and company name. Not all fields are in the response example.
 *     parameters:
 *       - in: path
 *         name: partyDbCompanyRegistrationNumber
 *         schema:
 *           type: string
 *           example: '12341234'
 *         required: true
 *         description: Companies House Registration Number to create the UKEF Party
 *     requestBody:
 *       required: true
 *       description: Company fields
 *       content:
 *         application/json:
 *           schema:
 *             name: companyName
 *              schema:
 *               type: string
 *               example: 'Some Name'
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
apiRoutes.post('/party-db/:partyDbCompanyRegistrationNumber', partyDb.createParty);

/**
 * @openapi
 * /party-db/urn/:urn:
 *   get:
 *     summary: Get a UKEF company
 *     tags: [APIM, Salesforce]
 *     description: Fetches complete company object from Party URN
 *     parameters:
 *       - in: path
 *         name: partyDbPartyUrn
 *         schema:
 *           type: integer
 *           example: 1234
 *         required: true
 *         description: Party unique reference number
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
apiRoutes.get('/party-db/urn/:urn', partyUrn.lookup);

/**
 * @openapi
 * /currency-exchange-rate/:source/:target:
 *   get:
 *     summary: Get the active exchange rate for the provided source and target currency codes
 *     tags: [Currency Exchange, APIM]
 *     description: >-
 *       ISO 3 currency codes.
 *       Note - the APIM API does not support XYZ to GBP conversion.
 *       To handle this scenario - behind the scenes in our controller, the source and target are reversed.
 *       In our response handler, we only return the `exchangeRate` (midPrice) field.
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
 *       - in: path
 *         name: date
 *         schema:
 *           type: string
 *           example: 1970-01-01
 *         required: false
 *         description: Historic date, in a valid ISO 8601 format.
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
apiRoutes.get('/currency-exchange-rate/:source/:target', currencyExchangeRate.getExchangeRate);

/**
 * @openapi
 * /exposure-period/:startDate/:endDate/:facilityType:
 *   get:
 *     summary: Get the exposure period in months for a facility
 *     tags: [Exposure Period, APIM]
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
apiRoutes.get('/exposure-period/:startDate/:endDate/:facilityType', exposurePeriod.getExposurePeriod);

/**
 * @openapi
 * /premium-schedule:
 *   get:
 *     summary: Get a repayment schedule for a facility
 *     tags: [Premium Schedule, APIM]
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
apiRoutes.get('/premium-schedule', premiumSchedule.getPremiumSchedule);

/**
 * @openapi
 * /companies/:registrationNumber:
 *   get:
 *     summary: Get company details from MDM API.
 *     tags: [APIM, Companies House]
 *     description: >-
 *       Get company details from MDM API. MDM API retrieves the relevant details from the Companies House API and the MDM database.
 *     parameters:
 *       - in: path
 *         name: registrationNumber
 *         schema:
 *           type: string
 *           example: UKEF0001
 *         required: true
 *         description: Companies House registration number
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Company'
 *       400:
 *         description: Bad request. Invalid Companies House registration number
 *       404:
 *         description: Not found. No company with this Companies House registration number exists
 *       422:
 *         description: Unprocessable entity. This Companies House registration number is for an overseas company and UKEF can only process applications from UK companies
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Internal server error
 */

apiRoutes.get('/companies/:registrationNumber', companies.getCompanyByRegistrationNumber);

/**
 * @openapi
 * /geospatial/addresses/postcode/:postcode:
 *   get:
 *     summary: Get a list of addresses from MDM API
 *     tags: [Addresses, APIM]
 *     description: >-
 *       Get a list of addresses from MDM API.
 *     parameters:
 *       - in: path
 *         name: OSPostcode
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
 *               $ref: '#/definitions/MdmGeospatialAddressesResponseBody'
 */
apiRoutes.get('/geospatial/addresses/postcode/:postcode', geospatialAddresses.lookup);

/**
 * @openapi
 * /estore:
 *   post:
 *     summary: Creates an exporter site (if not exist), buyer, deal and facility directories. Endpoint will also upload any relevant documents.
 *     tags: [Estore, APIM]
 *     description: Creates an eStore exporter site and then directories for buyer, deal and facilities. This endpoint will invoke multiple APIM eStore endpoints calls with response saved in `cron-job-logs` collection.
 *     requestBody:
 *       required: true
 *       description: Well formed payload for eStore API calls
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/EstoreRequestBody'
 *     responses:
 *       201:
 *         description: eStore payload has been accepted and processing has been initiated.
 *       208:
 *         description: eStore payload has previously been reported and execution is in progress.
 *       400:
 *         description: eStore payload has been declined due to malformed attributes.
 *       500:
 *         description: eStore payload has not been processed and failed due to an internal server error.
 */
apiRoutes.post('/estore/', eStore.create);

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
apiRoutes.post('/email', email.emailNotification);

/**
 * @openapi
 * /bank-holidays:
 *   get:
 *     summary: Get UK bank holidays
 *     tags: [Bank Holidays]
 *     description: Get UK bank holidays from Gov API
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/BankHolidaysResponseBody'
 */
apiRoutes.get('/bank-holidays', bankHolidays.getBankHolidays);
