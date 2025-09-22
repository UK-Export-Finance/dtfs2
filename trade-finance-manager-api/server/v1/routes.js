const express = require('express');

const openRouter = express.Router();
const authRouter = express.Router();

const passport = require('passport');

const { validateSsoFeatureFlagFalse, validateSsoFeatureFlagTrue } = require('./middleware/validate-sso-feature-flag');
const feedbackController = require('./controllers/feedback-controller');
const amendmentController = require('./controllers/amendment.controller');
const facilityController = require('./controllers/facility.controller');
const partyController = require('./controllers/party.controller');
const bankHolidaysController = require('./controllers/bank-holidays');
const utilisationReportsController = require('./controllers/utilisation-reports');
const banksController = require('./controllers/banks.controller');
const users = require('./controllers/user/user.routes');
const party = require('./controllers/deal.party-db');
const validation = require('./validation/route-validators/route-validators');
const handleExpressValidatorResult = require('./validation/route-validators/express-validator-result-handler');
const checkApiKey = require('./middleware/headers/check-api-key');
const { teamsRoutes } = require('./teams/routes');
const { dealsOpenRouter, dealsAuthRouter } = require('./deals/routes');
const { tasksRouter } = require('./tasks/routes');
const { ssoOpenRouter } = require('./sso/routes');

openRouter.use(checkApiKey);

openRouter.use('/sso', validateSsoFeatureFlagTrue, ssoOpenRouter);

authRouter.use(passport.authenticate('jwt', { session: false }));

openRouter.use('/', dealsOpenRouter);
authRouter.use('/', dealsAuthRouter);

authRouter.use('/', teamsRoutes);

authRouter.use('/', tasksRouter);

/**
 * @openapi
 * /feedback:
 *   post:
 *     summary: Post feedback to tfm-feedback collection
 *     tags: [Users]
 *     description: Post feedback to tfm-feedback collection with/without being logged in
 *     parameters:
 *       - in: feedback object
 *         schema:
 *           type: Object
 *         required: true
 *         description: parameters of the feedback form
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               role: 'user'
 *               team: 'RISK_MANAGER'
 *               whyUsingService: 'test'
 *               easyToUse: 'Very good'
 *               satisfied: 'very satisfied'
 *               howWeCanImprove: ''
 *               emailAddress: ''
 *               created: 2022-03-07T14:31:38.729+00:00

 *       400:
 *         description: validation errors
 */
openRouter.route('/feedback').post(feedbackController.create);

/**
 * @openapi
 * /user:
 *   post:
 *     summary: Post user to tfm-users collection
 *     tags: [Users]
 *     description: Post user to tfm-user
 *     requestBody:
 *       description: Fields required to create a deal. Creates other default fields
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userToCreate:
 *                 type: object
 *           example:
 *             userToCreate: { _id: '123' }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: '123456abc'
 *       400:
 *         description: Invalid User Id
 */
openRouter.route('/user').post(validateSsoFeatureFlagFalse, users.createTfmUser);

/**
 * @openapi
 * /user:
 *   post:
 *     summary: Post users to tfm-users collection
 *     tags: [Users]
 *     description: Post user to tfm-user
 *     requestBody:
 *       description: Fields required to create a deal. Creates other default fields
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userToCreate:
 *                 type: object
 *           example:
 *             userToCreate: { _id: '123' }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: '123456abc'
 *       400:
 *         description: Invalid User Id
 */
authRouter.route('/users').post(validateSsoFeatureFlagFalse, users.createTfmUser);

/**
 * @openapi
 * /users/:user:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     description: Get user by ID
 *     parameters:
 *       - in: path
 *         name: user
 *         required: true
 *         description: The user Id of the user to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: '123456abc'
 *       400:
 *         description: Invalid User Id
 *       404:
 *        description: User does not exist
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     description: Update user by ID
 *     parameters:
 *       - in: path
 *         name: user
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to update
 *     responses:
 *       200:
 *         description: The user was updated successfully
 *       404:
 *         description: User does not exist
 *       400:
 *         description: Invalid user Id
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     description: Delete user by ID
 *     parameters:
 *       - in: path
 *         name: user
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               acknowledged: true
 *               deletedCount: 1
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
authRouter
  .route('/users/:user')
  .get(validation.userIdEscapingSanitization, handleExpressValidatorResult, users.findTfmUser)
  .put(validateSsoFeatureFlagFalse, validation.userIdValidation, handleExpressValidatorResult, users.updateTfmUserById)
  .delete(validateSsoFeatureFlagFalse, validation.userIdValidation, handleExpressValidatorResult, users.removeTfmUserById);

/**
 * @openapi
 * /facilities:
 *   get:
 *     summary: Get all TFM facilities from TFM facilities collection
 *     tags: [TFM]
 *     description: Get all TFM facilities from TFM facilities collection
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
authRouter.route('/facilities').get(facilityController.getFacilities);

/**
 * @openapi
 * /facilities/:facilityId:
 *   get:
 *     summary: Get facility by ID
 *     tags: [TFM]
 *     description: Get facility by ID
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         required: true
 *         description: The facility Id of the facility to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: '123456abc'
 *       400:
 *         description: Invalid facility Id
 *       404:
 *        description: Facility does not exist
 *   put:
 *     summary: Update facility by ID
 *     tags: [TFM]
 *     description: Update facility by ID
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: Facility ID to update
 *     responses:
 *       200:
 *         description: The facility was updated successfully
 *       400:
 *         description: Invalid facility Id
 *       500:
 *         description: Failed to update facility
 */
authRouter
  .route('/facilities/:facilityId')
  .get(validation.facilityIdValidation, handleExpressValidatorResult, facilityController.getFacility)
  .put(validation.facilityIdValidation, handleExpressValidatorResult, facilityController.updateFacility);

/**
 * @openapi
 * /facility/:facilityId/amendments/:amendmentId:
 *   put:
 *     summary: Update amendment
 *     tags: [TFM - Amendments]
 *     description: Updates the amendment with the given id
 *     parameters:
 *       - in: facilityId, amendmentId
 *         schema:
 *           type: Object
 *         required: true
 *         description: parameters of the amendment object in tfm-facilities
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payload:
 *                 type: object
 *           example:
 *             payload: { aNewField: true }
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Unable to update amendment
 *       422:
 *         description: Unable to update amendment
 */
authRouter
  .route('/facilities/:facilityId/amendments/:amendmentId')
  .put(validation.facilityIdAndAmendmentIdValidations, handleExpressValidatorResult, amendmentController.updateFacilityAmendment);

/**
 * @openapi
 * /facilities/:facilityId/amendments/:amendmentIdOrStatus?/:type?:
 *   get:
 *     summary: Get amendment by facility ID, amendment ID, type or status
 *     tags: [TFM - Amendments]
 *     description: Get amendment by facility ID, amendment ID or status
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Invalid facility Id provided
 *       422:
 *         description: Unable to get the amendment by facilityId
 *       500:
 *         description: Internal server error
 */
authRouter
  .route('/facilities/:facilityId/amendments/:amendmentIdOrStatus?/:type?')
  .get(validation.facilityIdValidation, handleExpressValidatorResult, amendmentController.getAmendmentByFacilityId);

/**
 * @openapi
 * /tfm/facilities/:facilityId/amendments:
 *   post:
 *     summary: Creates new amendment object and changes status
 *     tags: [TFM - Amendments]
 *     description: Adds new amendment object in amendments array
 *     requestBody:
 *       description: Fields required to create amendment
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               facilityId:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Invalid facility id
 *       422:
 *          description: Unable to create amendment
 *       500:
 *         description: Failed to create facility amendment
 */
authRouter
  .route('/facilities/:facilityId/amendments')
  .post(validation.facilityIdValidation, handleExpressValidatorResult, amendmentController.createFacilityAmendment);

/**
 * @openapi
 * /amendments/:status?:
 *   get:
 *     summary: Get all amendments by status
 *     tags: [TFM - Amendments]
 *     description: Get all amendments by status
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       422:
 *         description: Unable to fetch amendments
 *       500:
 *         description: Internal server error
 */
authRouter.route('/amendments/:status?').get(amendmentController.getAllAmendments);

/**
 * @openapi
 * /party/urn/:urn:
 *   get:
 *     summary: Get company information from Party URN
 *     tags: [Party]
 *     description: Get company information from Party URN
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *        description: Invalid party urn provided
 *       404:
 *         description: Not found
 *       500:
 *        description: Failed to get bank holidays
 */
authRouter.route('/party/urn/:urn').get(validation.partyUrnValidation, handleExpressValidatorResult, party.getCompany);

/**
 * @openapi
 * /parties/:dealId:
 *   put:
 *     summary: Updates the parties in TFM associated with the deal
 *     tags: [Party]
 *     description: Updates the parties in TFM associated with the deal
 *     parameters:
 *       - in: dealId
 *         schema:
 *           type: Object
 *         required: true
 *         description: parameters to update the parties in TFM associated with the deal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *           example:
 *             data: { aNewField: true }
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Invalid deal id
 *       500:
 *         description: Failed to update party
 */
authRouter.route('/parties/:dealId').put(validation.dealIdValidation, handleExpressValidatorResult, partyController.updateParty);

/**
 * @openapi
 * /bank-holidays:
 *   get:
 *     summary: Get UK bank holidays from the external API.
 *     tags: [Bank Holidays]
 *     description: Get UK bank holidays from the external API.
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to get bank holidays
 */
authRouter.route('/bank-holidays').get(bankHolidaysController.getBankHolidays);

/**
 * @openapi
 * /utilisation-reports/reconciliation-summary/:submissionMonth:
 *   get:
 *     summary: Fetches a summary of utilisation report reconciliation progress for specified submission month for all banks.
 *     tags: [Utilisation Report]
 *     description: Fetches a summary of utilisation report reconciliation progress for specified submission month for all banks.
 *     parameters:
 *       - in: path
 *         name: submissionMonth
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to get utilisation reports reconciliation summary
 */
authRouter
  .route('/utilisation-reports/reconciliation-summary/:submissionMonth')
  .get(validation.isoMonthValidation('submissionMonth'), handleExpressValidatorResult, utilisationReportsController.getUtilisationReportsReconciliationSummary);

/**
 * @openapi
 * /utilisation-reports/:id/download:
 *   get:
 *     summary: Fetches the downloaded utilisation report with specified id.
 *     tags: [Utilisation Report]
 *     description: Fetches the downloaded utilisation report with specified id.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 *       500:
 *         description: Failed to get utilisation report for download with specified id
 */
authRouter
  .route('/utilisation-reports/:id/download')
  .get(validation.sqlIdValidation('id'), handleExpressValidatorResult, utilisationReportsController.getUtilisationReportDownload);

/**
 * @openapi
 * /utilisation-reports/reconciliation-details/:reportId:
 *   get:
 *     summary: Fetches utilisation report reconciliation details by id.
 *     tags: [Utilisation Report]
 *     description: Fetches utilisation report reconciliation details by id.
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to get utilisation report reconciliation details by id
 */
authRouter
  .route('/utilisation-reports/reconciliation-details/:reportId')
  .get(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, utilisationReportsController.getUtilisationReportReconciliationDetailsById);

/**
 * @openapi
 * /utilisation-reports/:id/selected-fee-records-details:
 *   get:
 *     summary: Fetches selected fee records details
 *     tags: [Utilisation Report]
 *     description: Fetches selected fee records details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to get selected fee records details
 */
authRouter
  .route('/utilisation-reports/:id/selected-fee-records-details')
  .get(validation.sqlIdValidation('id'), handleExpressValidatorResult, utilisationReportsController.getSelectedFeeRecordsDetails);

/**
 * @openapi
 * /utilisation-reports/:reportId/payment:
 *   post:
 *     summary: Adds a payment to the supplied fee records
 *     tags: [Utilisation Report]
 *     description: Adds a payment to the supplied fee records
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Fields required to add payment
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feeRecordIds:
 *                 type: array
 *               paymentCurrency:
 *                 type: string
 *               datePaymentReceived:
 *                 type: Date
 *               paymentReference:
 *                 type: string
 *               user:
 *                 type: object
 *           example:
 *             feeRecordIds: [5, 6, 7]
 *             paymentCurrency: 'GBP'
 *             datePaymentReceived: '2023-10-10'
 *             paymentReference: 'Test reference'
 *             user: { _id: '123' }
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to add payment
 */
authRouter
  .route('/utilisation-reports/:reportId/payment')
  .post(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, utilisationReportsController.postPayment);

/**
 * @openapi
 * /banks:
 *   get:
 *     summary: Fetches all banks
 *     tags: [Bank]
 *     description: Fetches all banks
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to get banks
 */
authRouter.route('/banks').get(banksController.getBanks);

/**
 * @openapi
 * /bank/:bankId/utilisation-reports/reconciliation-summary-by-year/:year:
 *   get:
 *     summary: Fetches a list of utilisation reports reconciliation progress for specified year and bank.
 *     tags: [Utilisation Report]
 *     description: Fetches a list of utilisation reports reconciliation progress for specified year and bank.
 *     parameters:
 *       - in: path
 *         name: bankId, year
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to get previous utilisation reports by bank id and year.
 */
authRouter
  .route('/bank/:bankId/utilisation-reports/reconciliation-summary-by-year/:year')
  .get(
    validation.bankIdValidation,
    validation.isoYearValidation('year'),
    handleExpressValidatorResult,
    utilisationReportsController.getUtilisationReportSummariesByBankAndYear,
  );

/**
 * @openapi
 * /utilisation-reports/:reportId/keying-data/mark-as-done:
 *   put:
 *     summary: Updates mark keying data as done
 *     tags: [Utilisation Report]
 *     description: Updates mark keying data as done
 *     parameters:
 *       - in: reportId
 *         schema:
 *           type: Object
 *         required: true
 *         description: Fields required to update the keying data as done
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feeRecordIds:
 *                 type: array
 *               user:
 *                 type: object
 *           example:
 *             feeRecordIds: [5, 6, 7]
 *             user: { _id: '123' }
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to mark keying data as done
 */
authRouter
  .route('/utilisation-reports/:reportId/keying-data/mark-as-done')
  .put(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, utilisationReportsController.putKeyingDataMarkAsDone);

/**
 * @openapi
 * /utilisation-reports/:reportId/keying-data/mark-as-to-do:
 *   put:
 *     summary: Updates mark keying data as to do
 *     tags: [Utilisation Report]
 *     description: Updates mark keying data as to do
 *     parameters:
 *       - in: reportId
 *         schema:
 *           type: Object
 *         required: true
 *         description: Fields required to update the keying data as to do
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feeRecordIds:
 *                 type: array
 *               user:
 *                 type: object
 *           example:
 *             feeRecordIds: [5, 6, 7]
 *             user: { _id: '123' }
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to mark keying data as to do
 */
authRouter
  .route('/utilisation-reports/:reportId/keying-data/mark-as-to-do')
  .put(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, utilisationReportsController.putKeyingDataMarkAsToDo);

/**
 * @openapi
 * /utilisation-reports/:reportId/keying-data:
 *   post:
 *     summary: Generates keying data for the utilisation report with the supplied id
 *     tags: [Utilisation Report]
 *     description: Generates keying data for the utilisation report with the supplied id
 *     parameters:
 *       - in: reportId
 *         schema:
 *           type: Object
 *         required: true
 *         description: Fields required to generate keying data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: object
 *           example:
 *             user: { _id: '123' }
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to generate keying data
 */
authRouter
  .route('/utilisation-reports/:reportId/keying-data')
  .post(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, utilisationReportsController.postKeyingData);

/**
 * @openapi
 * /utilisation-reports/:reportId/fee-records-to-key:
 *   get:
 *     summary: Fetches utilisation report with the fee to key
 *     tags: [Utilisation Report]
 *     description: Fetches utilisation report with the fee to key
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         description: Fields required to get fee records to key
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to get fee records to key
 */
authRouter
  .route('/utilisation-reports/:reportId/fee-records-to-key')
  .get(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, utilisationReportsController.getFeeRecordsToKey);

/**
 * @openapi
 * /utilisation-reports/:reportId/payment/:paymentId:
 *   get:
 *     summary: Fetches the payment details with the attached fee records
 *     tags: [Utilisation Report]
 *     description: Fetches the payment details with the attached fee records
 *     parameters:
 *       - in: path
 *         name: reportId, paymentId
 *         required: true
 *         description: Fields required to get payment details with the attached fee records
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to get payment details
 *   delete:
 *     summary: Deletes the payment with the specified id
 *     tags: [Utilisation Report]
 *     description: Deletes the payment with the specified id
 *     parameters:
 *       - in: path
 *         name: reportId, paymentId
 *         required: true
 *         description: Fields required to delete the payment with the specified id
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: object
 *           example:
 *             user: { _id: '123' }
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to delete payment
 *   patch:
 *     summary: Updates the payment with the supplied edit payment form values
 *     tags: [Utilisation Report]
 *     description: Updates the payment with the supplied edit payment form values
 *     parameters:
 *       - in: path
 *         name: reportId, paymentId
 *         required: true
 *         description: Fields required to edit the payment with the supplied edit payment form values
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentAmount:
 *                 type: number
 *               datePaymentReceived:
 *                 type: Date
 *               paymentReference:
 *                 type: string
 *               user:
 *                 type: object
 *           example:
 *             paymentAmount: 123.45
 *             datePaymentReceived: '2023-10-10'
 *             paymentReference: 'Test reference'
 *             user: { _id: '123' }
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to edit payment
 */
authRouter
  .route('/utilisation-reports/:reportId/payment/:paymentId')
  .all(validation.sqlIdValidation('reportId'), validation.sqlIdValidation('paymentId'), handleExpressValidatorResult)
  .get(utilisationReportsController.getPaymentDetailsById)
  .delete(utilisationReportsController.deletePayment)
  .patch(utilisationReportsController.patchPayment);

/**
 * @openapi
 * /utilisation-reports/:reportId/payment/:paymentId:/remove-selected-fees:
 *   post:
 *     summary: Removes the supplied fee records from a supplied payment
 *     tags: [Utilisation Report]
 *     description: Removes the supplied fee records from a supplied payment
 *     parameters:
 *       - in: path
 *         name: reportId, paymentId
 *         required: true
 *         description: Fields required to remove the supplied fee records from a supplied payment
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               selectedFeeRecordIds:
 *                 type: array
 *               user:
 *                 type: object
 *           example:
 *             selectedFeeRecordIds: [5, 6, 7]
 *             user: { _id: '123' }
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to remove fees from payment group
 */
authRouter
  .route('/utilisation-reports/:reportId/payment/:paymentId/remove-selected-fees')
  .post(
    validation.sqlIdValidation('reportId'),
    validation.sqlIdValidation('paymentId'),
    handleExpressValidatorResult,
    utilisationReportsController.postRemoveFeesFromPayment,
  );

/**
 * @openapi
 * /utilisation-reports/:reportId/add-to-an-existing-payment:
 *   post:
 *     summary: Adds the supplied fee records to an existing payment
 *     tags: [Utilisation Report]
 *     description: Adds the supplied fee records to an existing payment
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         description: Fields required to add the supplied fee records to an existing payment
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feeRecordIds:
 *                 type: array
 *               paymentIds:
 *                type: array
 *               user:
 *                 type: object
 *           example:
 *             feeRecordIds: [5, 6, 7]
 *             paymentIds: [1, 2, 3]
 *             user: { _id: '123' }
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to add fees to an existing payment
 */
authRouter
  .route('/utilisation-reports/:reportId/add-to-an-existing-payment')
  .post(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, utilisationReportsController.postFeesToAnExistingPayment);

/**
 * @openapi
 * /utilisation-reports/:reportId/fee-records/:feeRecordId:
 *   get:
 *     summary: Fetches the fee record
 *     tags: [Utilisation Report]
 *     description: Fetches the fee record
 *     parameters:
 *       - in: path
 *         name: reportId, feeRecordId
 *         required: true
 *         description: Fields required to get the fee record
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to get fee record
 */
authRouter
  .route('/utilisation-reports/:reportId/fee-records/:feeRecordId')
  .all(validation.sqlIdValidation('reportId'), validation.sqlIdValidation('feeRecordId'), handleExpressValidatorResult)
  .get(utilisationReportsController.getFeeRecord);

/**
 * @openapi
 * /utilisation-reports/:reportId/fee-records/:feeRecordId/correction-request-review/:user:
 *   get:
 *     summary: Fetches the fee record correction request review
 *     tags: [Utilisation Report]
 *     description: Fetches the fee record
 *     parameters:
 *       - in: path
 *         name: reportId, feeRecordId, user
 *         required: true
 *         description: Fields required to get the fee record correction request review
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to get fee record correction request review
 */
authRouter
  .route('/utilisation-reports/:reportId/fee-records/:feeRecordId/correction-request-review/:user')
  .all(validation.sqlIdValidation('reportId'), validation.sqlIdValidation('feeRecordId'), validation.userIdValidation, handleExpressValidatorResult)
  .get(utilisationReportsController.getFeeRecordCorrectionRequestReview);

/**
 * @openapi
 * /utilisation-reports/:reportId/fee-records/:feeRecordId/correction-transient-form-data:
 *   put:
 *     summary: Updates the fee record correction transient form data associated with the user
 *     tags: [Utilisation Report]
 *     description: Updates the fee record correction transient form data associated with the user
 *     parameters:
 *       - in: reportId, feeRecordId
 *         schema:
 *           type: string
 *         required: true
 *         description: Fields required to update the fee record correction transient form data associated with the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               formData:
 *                 type: object
 *               user:
 *                 type: object
 *           example:
 *             formData: { reasons: ['reason 1', 'reason 2'], additionalInfo: 'some more info' }
 *             user: { _id: '123' }
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to put fee record correction transient form data
 */
authRouter
  .route('/utilisation-reports/:reportId/fee-records/:feeRecordId/correction-transient-form-data')
  .all(validation.sqlIdValidation('reportId'), validation.sqlIdValidation('feeRecordId'), handleExpressValidatorResult)
  .put(utilisationReportsController.putFeeRecordCorrectionTransientFormData);

/**
 * @openapi
 * /utilisation-reports/:reportId/fee-records/:feeRecordId/corrections:
 *   post:
 *     summary: Creates a new fee record correction
 *     tags: [Utilisation Report]
 *     description: Creates a new fee record correction
 *     parameters:
 *       - in: reportId, feeRecordId
 *         schema:
 *           type: string
 *         required: true
 *         description: Fields required to create a new fee record correction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: object
 *           example:
 *             user: { _id: '123' }
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to create fee record correction
 */
authRouter
  .route('/utilisation-reports/:reportId/fee-records/:feeRecordId/corrections')
  .all(validation.sqlIdValidation('reportId'), validation.sqlIdValidation('feeRecordId'), handleExpressValidatorResult)
  .post(utilisationReportsController.postFeeRecordCorrection);

/**
 * @openapi
 * /utilisation-reports/:reportId/fee-records/:feeRecordId/correction-transient-form-data/:user:
 *   get:
 *     summary: Fetches the users fee record correction transient form data for the given fee record id
 *     tags: [Utilisation Report]
 *     description: Fetches the users fee record correction transient form data for the given fee record id
 *     parameters:
 *       - in: path
 *         name: reportId, feeRecordId, user
 *         required: true
 *         description: Fields required to get the users fee record correction transient form data for the given fee record id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to get fee record correction transient form data
 *   delete:
 *     summary: Deletes the users fee record correction transient form data for the given fee record id
 *     tags: [Utilisation Report]
 *     description: Deletes the users fee record correction transient form data for the given fee record id
 *     parameters:
 *       - in: path
 *         name: reportId, feeRecordId, user
 *         required: true
 *         description: Fields required to delete the users fee record correction transient form data for the given fee record id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       204:
 *         description: No content
 *       500:
 *         description: Failed to delete fee record correction transient form data
 *
 */
authRouter
  .route('/utilisation-reports/:reportId/fee-records/:feeRecordId/correction-transient-form-data/:user')
  .all(validation.sqlIdValidation('reportId'), validation.sqlIdValidation('feeRecordId'), validation.userIdValidation, handleExpressValidatorResult)
  .get(utilisationReportsController.getFeeRecordCorrectionTransientFormData)
  .delete(utilisationReportsController.deleteFeeRecordCorrectionTransientFormData);

/**
 * @openapi
 * /utilisation-reports/record-correction-log-details/:correctionId:
 *   get:
 *     summary: Fetches record correction log details by id
 *     tags: [Utilisation Report]
 *     description: Fetches record correction log details by id
 *     parameters:
 *       - in: path
 *         name: correctionId
 *         required: true
 *         description: Fields required to get record correction log details by id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Failed to get record correction log details
 */
authRouter
  .route('/utilisation-reports/record-correction-log-details/:correctionId')
  .get(validation.sqlIdValidation('correctionId'), handleExpressValidatorResult, utilisationReportsController.getRecordCorrectionLogDetailsById);

module.exports = { authRouter, openRouter };
