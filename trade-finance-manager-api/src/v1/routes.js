const express = require('express');
const swaggerUi = require('swagger-ui-express');

const openRouter = express.Router();
const authRouter = express.Router();

const passport = require('passport');

const { swaggerSpec, swaggerUiOptions } = require('./swagger');
const dealSubmit = require('./controllers/deal.submit.controller');
const feedbackController = require('./controllers/feedback-controller');
const amendmentController = require('./controllers/amendment.controller');
const dealController = require('./controllers/deal.controller');
const facilityController = require('./controllers/facility.controller');
const partyController = require('./controllers/party.controller');
const users = require('./controllers/user/user.routes');
const party = require('./controllers/deal.party-db');
const validation = require('./validation/route-validators/route-validators');
const handleValidationResult = require('./validation/route-validators/validation-handler');
const checkApiKey = require('./middleware/headers/check-api-key');

openRouter.use(checkApiKey);
authRouter.use(passport.authenticate('jwt', { session: false }));

authRouter.route('/api-docs').get(swaggerUi.setup(swaggerSpec, swaggerUiOptions));

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

authRouter.route('/deals/submitDealAfterUkefIds').put(dealSubmit.submitDealAfterUkefIdsPUT);

authRouter.route('/deals').get(dealController.getDeals);

authRouter.route('/deals/:dealId').get(validation.dealIdValidation, handleValidationResult, dealController.getDeal);

authRouter
  .route('/deals/:dealId/amendments/:status?/:type?')
  .get(validation.dealIdValidation, handleValidationResult, amendmentController.getAmendmentsByDealId);
  
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
  .get(validation.userIdEscapingSanitization, handleValidationResult, users.findTfmUser)
  .put(validation.userIdValidation, handleValidationResult, users.updateTfmUserById)
  .delete(validation.userIdValidation, handleValidationResult, users.removeTfmUserById);

authRouter
  .route('/facilities')
  .get(facilityController.getFacilities);

authRouter
  .route('/facilities/:facilityId')
  .get(validation.facilityIdValidation, handleValidationResult, facilityController.getFacility)
  .put(validation.facilityIdValidation, handleValidationResult, facilityController.updateFacility);

authRouter
  .route('/facilities/:facilityId/amendments/:amendmentId')
  .put(validation.facilityIdAndAmendmentIdValidations, handleValidationResult, amendmentController.updateFacilityAmendment);

authRouter
  .route('/facilities/:facilityId/amendments/:amendmentIdOrStatus?/:type?')
  .get(validation.facilityIdValidation, handleValidationResult, amendmentController.getAmendmentByFacilityId);

authRouter
  .route('/facilities/:facilityId/amendments')
  .post(validation.facilityIdValidation, handleValidationResult, amendmentController.createFacilityAmendment);

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

authRouter.route('/party/urn/:urn').get(validation.partyUrnValidation, handleValidationResult, party.getCompany);
authRouter.route('/parties/:dealId').put(validation.dealIdValidation, handleValidationResult, partyController.updateParty);

module.exports = { authRouter, openRouter };
