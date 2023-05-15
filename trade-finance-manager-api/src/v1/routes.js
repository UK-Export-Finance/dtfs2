const express = require('express');
const swaggerUi = require('swagger-ui-express');

const openRouter = express.Router();

const { swaggerSpec, swaggerUiOptions } = require('./swagger');
const dealSubmit = require('./controllers/deal.submit.controller');
const feedbackController = require('./controllers/feedback-controller');
const amendmentController = require('./controllers/amendment.controller');
const users = require('./controllers/user/user.routes');
const party = require('./controllers/deal.party-db');
const validation = require('./validation/route-validators/route-validators');
const handleValidationResult = require('./validation/route-validators/validation-handler');

openRouter.route('/api-docs').get(swaggerUi.setup(swaggerSpec, swaggerUiOptions));

/**
 * @openapi
 * /deals/submit:
 *   put:
 *     summary: Submit a deal
 *     tags: [Deals]
 *     description: Creates snapshots (via Central API), calls external APIs, sends status update to internal APIs
 *     requestBody:
 *       description: Fields required to find a deal and send updates to Portal. The checker object is for Portal update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dealId:
 *                 type: string
 *               dealType:
 *                 type: string
 *               checker:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   firstname:
 *                     type: string
 *                   surname:
 *                     type: string
 *             example:
 *               dealId: 123abc
 *               dealType: BSS/EWCS
 *               checker:
 *                 _id: 123abc
 *                 username: BANK1_CHECKER1
 *                 firstname: Joe
 *                 surname: Bloggs
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: 123abc
 *               dealSnapshot:
 *                 _id: 123abc
 *                 dealType: BSS/EWCS
 *                 status: Submitted
 *                 submissionCount: 1
 *                 facilities: ['123', '456']
 *               tfm:
 *                 product: BSS & EWCS
 *                 dateReceived: 16-09-2021
 *                 stage: Confirmed
 *                 exporterCreditRating: Acceptable (B+)
 *       404:
 *         description: Not found
 */
openRouter.route('/deals/submit').put(dealSubmit.submitDealPUT);

openRouter.route('/deals/submitDealAfterUkefIds').put(dealSubmit.submitDealAfterUkefIdsPUT);

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

openRouter.route('/users').post(users.createTfmUser);

openRouter
  .route('/users/:user')
  .get(validation.userEndpointValidation, handleValidationResult, users.findTfmUser)
  .put(validation.userEndpointValidation, handleValidationResult, users.updateTfmUserById)
  .delete(validation.userEndpointValidation, handleValidationResult, users.removeTfmUserById);

openRouter.route('/login').post(users.login);

openRouter
  .route('/facility/:facilityId/amendment')
  .post(validation.createFacilityAmendmentValidations, handleValidationResult, amendmentController.createFacilityAmendment);

/**
 * @openapi
 * /facility/:facilityId/amendment:amendmentId:
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
openRouter.route('/amendments/status/in-progress').get(amendmentController.getAllAmendmentsInProgress);
openRouter
  .route('/facility/:facilityId/amendment/')
  .get(validation.getAmendmentByFacilityIdValidations, handleValidationResult, amendmentController.getAmendmentByFacilityId);
openRouter
  .route('/facility/:facilityId/amendment/:amendmentId')
  .put(validation.updateFacilityAmendmentValidations, handleValidationResult, amendmentController.updateFacilityAmendment);
openRouter
  .route('/facility/:facilityId/amendment/:amendmentId')
  .get(validation.getAmendmentByIdValidations, handleValidationResult, amendmentController.getAmendmentById);
openRouter
  .route('/facility/:facilityId/amendment/status/in-progress')
  .get(validation.getAmendmentInProgressValidations, handleValidationResult, amendmentController.getAmendmentInProgress);
openRouter
  .route('/facility/:facilityId/amendment/status/completed')
  .get(validation.getCompletedAmendmentValidations, handleValidationResult, amendmentController.getCompletedAmendment);
openRouter
  .route('/facility/:facilityId/amendment/status/completed/latest-value')
  .get(validation.getLatestCompletedAmendmentValueValidations, handleValidationResult, amendmentController.getLatestCompletedAmendmentValue);
openRouter
  .route('/facility/:facilityId/amendment/status/completed/latest-cover-end-date')
  .get(validation.getLatestCompletedAmendmentDateValidations, handleValidationResult, amendmentController.getLatestCompletedAmendmentDate);
openRouter
  .route('/deal/:dealId/amendments/')
  .get(validation.getAmendmentsByDealIdValidations, handleValidationResult, amendmentController.getAmendmentsByDealId);
openRouter
  .route('/deal/:dealId/amendment/status/in-progress')
  .get(validation.getAmendmentInProgressByDealIdValidations, handleValidationResult, amendmentController.getAmendmentInProgressByDealId);
openRouter
  .route('/deal/:dealId/amendment/status/completed')
  .get(validation.getCompletedAmendmentByDealIdValidations, handleValidationResult, amendmentController.getCompletedAmendmentByDealId);
openRouter
  .route('/deal/:dealId/amendment/status/completed/latest')
  .get(
    validation.getLatestCompletedAmendmentByDealIdValidations,
    handleValidationResult,
    amendmentController.getLatestCompletedAmendmentByDealId,
  );

openRouter.route('/party/urn/:urn').get(validation.getCompanyValidations, handleValidationResult, party.getCompany);

module.exports = openRouter;
