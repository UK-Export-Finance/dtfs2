const express = require('express');
const swaggerUi = require('swagger-ui-express');

const openRouter = express.Router();
const authRouter = express.Router();

const passport = require('passport');

const { swaggerSpec, swaggerUiOptions } = require('./swagger');
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

openRouter.use(checkApiKey);
authRouter.use(passport.authenticate('jwt', { session: false }));

authRouter.route('/api-docs').get(swaggerUi.setup(swaggerSpec, swaggerUiOptions));

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

openRouter.route('/user').post(users.createTfmUser);
authRouter.route('/users').post(users.createTfmUser);

authRouter
  .route('/users/:user')
  .get(validation.userIdEscapingSanitization, handleExpressValidatorResult, users.findTfmUser)
  .put(validation.userIdValidation, handleExpressValidatorResult, users.updateTfmUserById)
  .delete(validation.userIdValidation, handleExpressValidatorResult, users.removeTfmUserById);

authRouter.route('/facilities').get(facilityController.getFacilities);

authRouter
  .route('/facilities/:facilityId')
  .get(validation.facilityIdValidation, handleExpressValidatorResult, facilityController.getFacility)
  .put(validation.facilityIdValidation, handleExpressValidatorResult, facilityController.updateFacility);

authRouter
  .route('/facilities/:facilityId/amendments/:amendmentId')
  .put(validation.facilityIdAndAmendmentIdValidations, handleExpressValidatorResult, amendmentController.updateFacilityAmendment);

authRouter
  .route('/facilities/:facilityId/amendments/:amendmentIdOrStatus?/:type?')
  .get(validation.facilityIdValidation, handleExpressValidatorResult, amendmentController.getAmendmentByFacilityId);

authRouter
  .route('/facilities/:facilityId/amendments')
  .post(validation.facilityIdValidation, handleExpressValidatorResult, amendmentController.createFacilityAmendment);

/**
 * @openapi
 * /facility/:facilityId/amendments:amendmentId:
 *   post:
 *     summary: Update amendment
 *     description: Updates the amendment with the given id
 *     parameters:
 *       - in: facilityId, amendmentId and payload
 *         schema:
 *           type: Object
 *         required: true
 *         description: parameters of the amendment object in tfm-facilities
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example: { requestDate: 1555662, creationTimestamp: 1555662, createdBy: user }
 *       404:
 *         description: Deal not found
 *       400:
 *         description: Cannot update the amendment
 */
authRouter.route('/amendments/:status?').get(amendmentController.getAllAmendments);

authRouter.route('/party/urn/:urn').get(validation.partyUrnValidation, handleExpressValidatorResult, party.getCompany);
authRouter.route('/parties/:dealId').put(validation.dealIdValidation, handleExpressValidatorResult, partyController.updateParty);

authRouter.route('/bank-holidays').get(bankHolidaysController.getBankHolidays);

authRouter
  .route('/utilisation-reports/reconciliation-summary/:submissionMonth')
  .get(validation.isoMonthValidation('submissionMonth'), handleExpressValidatorResult, utilisationReportsController.getUtilisationReportsReconciliationSummary);

authRouter
  .route('/utilisation-reports/:id/download')
  .get(validation.sqlIdValidation('id'), handleExpressValidatorResult, utilisationReportsController.getUtilisationReportDownload);

authRouter
  .route('/utilisation-reports/set-status')
  .put(validation.updateReportStatusPayloadValidation, handleExpressValidatorResult, utilisationReportsController.updateUtilisationReportStatus);

authRouter
  .route('/utilisation-reports/reconciliation-details/:reportId')
  .get(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, utilisationReportsController.getUtilisationReportReconciliationDetailsById);

authRouter
  .route('/utilisation-reports/:id/selected-fee-records-details')
  .get(validation.sqlIdValidation('id'), handleExpressValidatorResult, utilisationReportsController.getSelectedFeeRecordsDetails);

authRouter
  .route('/utilisation-reports/:reportId/payment')
  .post(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, utilisationReportsController.postPayment);

authRouter.route('/banks').get(banksController.getBanks);

authRouter
  .route('/bank/:bankId/utilisation-reports/reconciliation-summary-by-year/:year')
  .get(
    validation.bankIdValidation,
    validation.isoYearValidation('year'),
    handleExpressValidatorResult,
    utilisationReportsController.getUtilisationReportSummariesByBankAndYear,
  );

authRouter
  .route('/utilisation-reports/:reportId/keying-data/mark-as-done')
  .put(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, utilisationReportsController.putKeyingDataMarkAsDone);

authRouter
  .route('/utilisation-reports/:reportId/keying-data/mark-as-to-do')
  .put(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, utilisationReportsController.putKeyingDataMarkAsToDo);

authRouter
  .route('/utilisation-reports/:reportId/keying-data')
  .post(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, utilisationReportsController.postKeyingData);

authRouter
  .route('/utilisation-reports/:reportId/fee-records-to-key')
  .get(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, utilisationReportsController.getFeeRecordsToKey);

authRouter
  .route('/utilisation-reports/:reportId/payment/:paymentId')
  .all(validation.sqlIdValidation('reportId'), validation.sqlIdValidation('paymentId'), handleExpressValidatorResult)
  .get(utilisationReportsController.getPaymentDetailsById)
  .delete(utilisationReportsController.deletePayment)
  .patch(utilisationReportsController.patchPayment);

authRouter
  .route('/utilisation-reports/:reportId/payment/:paymentId/remove-selected-fees')
  .post(
    validation.sqlIdValidation('reportId'),
    validation.sqlIdValidation('paymentId'),
    handleExpressValidatorResult,
    utilisationReportsController.postRemoveFeesFromPayment,
  );

authRouter
  .route('/utilisation-reports/:reportId/add-to-an-existing-payment')
  .post(validation.sqlIdValidation('reportId'), handleExpressValidatorResult, utilisationReportsController.postFeesToAnExistingPayment);

module.exports = { authRouter, openRouter };
