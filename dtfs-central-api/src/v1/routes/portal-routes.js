const express = require('express');
const { query, param } = require('express-validator');

const portalRouter = express.Router();
const createDealController = require('../controllers/portal/deal/create-deal.controller');
const getDealController = require('../controllers/portal/deal/get-deal.controller');
const updateDealController = require('../controllers/portal/deal/update-deal.controller');
const updateDealStatusController = require('../controllers/portal/deal/update-deal-status.controller');
const deleteDealController = require('../controllers/portal/deal/delete-deal.controller');
const addDealCommentController = require('../controllers/portal/deal/add-deal-comment.controller');

const createFacilityController = require('../controllers/portal/facility/create-facility.controller');
const createMultipleFacilitiesController = require('../controllers/portal/facility/create-multiple-facilities.controller');
const getFacilityController = require('../controllers/portal/facility/get-facility.controller');
const getFacilitiesController = require('../controllers/portal/facility/get-facilities.controller');
const updateFacilityController = require('../controllers/portal/facility/update-facility.controller');
const deleteFacilityController = require('../controllers/portal/facility/delete-facility.controller');
const updateFacilityStatusController = require('../controllers/portal/facility/update-facility-status.controller');

const getBankController = require('../controllers/bank/get-bank.controller');
const createBankController = require('../controllers/bank/create-bank.controller');

const gefActivityController = require('../controllers/portal/deal/add-min-activities.controller');

const durableFunctionsController = require('../controllers/durable-functions/durable-functions.controller');
const cronJobsController = require('../controllers/cron-jobs/cron-jobs.controller');

const mandatoryCriteria = require('../controllers/portal/mandatory-criteria');
const eligibilityCriteria = require('../controllers/portal/eligibility-criteria');

const { PORTAL_ROUTE } = require('../../constants/routes');
const { hasValidationErrors } = require('../validation/hasValidationErrors.validate');

portalRouter.use((req, res, next) => {
  req.routePath = PORTAL_ROUTE;
  next();
});

/**
 * @openapi
 * /bank:
 *   post:
 *     summary: Create a bank in banks collection
 *     tags: [Bank]
 *     description: Create a bank in banks collection
 *     requestBody:
 *       description: Fields required to create a bank. No validation in place.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/Bank'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: 123456abc
 */
portalRouter.route('/banks').post(createBankController.createBankPost);

/**
 * @openapi
 * /bank/:id:
 *   get:
 *     summary: Get a bank by ID
 *     tags: [Bank]
 *     description: Get a bank by ID. Not MongoDB _id, but the bank ID provided when created.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Bank ID to get
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/Bank'
 *                 - type: object
 *                   properties:
 *                     _id:
 *                       example: 123456abc
 *       404:
 *         description: Not found
 */
portalRouter.route('/banks/:id').get(getBankController.findOneBankGet);

/**
 * @openapi
 * /portal/deals:
 *   post:
 *     summary: Create a BSS deal in Portal deals collection
 *     tags: [Portal - BSS]
 *     description: Create a deal in Portal deals collection
 *     requestBody:
 *       description: Fields required to create a deal. Creates other default fields
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deal:
 *                 type: object
 *                 properties:
 *                   details:
 *                     type: object
 *           example:
 *             bankInternalRefName: 'a1'
 *             additionalRefName: 'test'
 *             bank: { id: '9' }
 *             maker: { _id: '123abc' }
 *             details:
 *               ukefDealId: '20010739'
 *               submissionCount: 1
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: '123456abc'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               deal:
 *                 _id: '123456abc'
 *                 details: {}
 *                 facilities: []
 *               validationErrors:
 *                 count: 2
 *                 errorList:
 *                   bankInternalRefName:
 *                     order: '1'
 *                     text: 'Enter the Bank deal ID'
 *                   additionalRefName:
 *                     order: '2'
 *                     text: 'Enter the Bank deal name'
 */
portalRouter.route('/deals').post(createDealController.postBssDeal);

/**
 * @openapi
 * /portal/deals/:id:
 *   get:
 *     summary: Get a Portal BSS deal
 *     tags: [Portal - BSS]
 *     description: Get a Portal BSS deal. Returns associated facilities in bondTransactions/loanTransactions structure
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Deal ID to get
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/DealBSS'
 *                 - type: object
 *                   properties:
 *                     _id:
 *                       example: 123456abc
 *       404:
 *         description: Not found
 */
portalRouter.route('/deals/:id').get(param('id').isMongoId(), hasValidationErrors, getDealController.getOneBssDeal);

/**
 * @openapi
 * /portal/deals/:id:
 *   put:
 *     summary: Update a Portal BSS deal
 *     tags: [Portal - BSS]
 *     description: Update a Portal BSS deal
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Deal ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               user: { _id: '123456abc' }
 *               dealUpdate: { aNewField: true }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/DealBSS'
 *                 - type: object
 *                   properties:
 *                     aNewField:
 *                       example: true
 *       404:
 *         description: Not found
 */
portalRouter.route('/deals/:id').put(param('id').isMongoId(), hasValidationErrors, updateDealController.putBssDeal);

/**
 * @openapi
 * /portal/deals/:id:
 *   delete:
 *     summary: Delete a Portal BSS deal
 *     tags: [TFM]
 *     description: Delete a Portal BSS deal by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Deal ID to delete
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               acknowledged: true
 *               deletedCount: 1
 */
portalRouter.route('/deals/:id').delete(param('id').isMongoId(), hasValidationErrors, deleteDealController.deleteDeal);

/**
 * @openapi
 * /portal/deals/:id/status:
 *   put:
 *     summary: Update a Portal BSS deal status
 *     tags: [Portal - BSS]
 *     description: Update a Portal BSS deal status
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Deal ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               status: Acknowledged
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/DealBSS'
 *                 - type: object
 *                   properties:
 *                     details:
 *                       properties:
 *                         previousStatus:
 *                           example: Submitted
 *                         status:
 *                           example: Acknowledged
 *       404:
 *         description: Not found
 */
portalRouter.route('/deals/:id/status').put(param('id').isMongoId(), hasValidationErrors, updateDealStatusController.putBssDealStatus);

/**
 * @openapi
 * /portal/deals/:id/comment:
 *   post:
 *     summary: Add a comment to a BSS deal in Portal deals collection
 *     tags: [Portal - BSS]
 *     description: Add a comment to a BSS deal in Portal deals collection
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Deal ID to add comment
 *     requestBody:
 *       description: Required fields
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentType:
 *                 type: string
 *                 example: 'comment'
 *               comment:
 *                 type: object
 *                 properties:
 *                   user:
 *                     type: object
 *                     schema:
 *                       $ref: '#/definitions/User'
 *                   text:
 *                     type: string
 *                     example: Amazing comment
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/DealBSS'
 *       404:
 *         description: Deal not found
 */
portalRouter.route('/deals/:id/comment').post(param('id').isMongoId(), hasValidationErrors, addDealCommentController.postCommentToDeal);

/**
 * @openapi
 * /portal/facilities:
 *   get:
 *     summary: Get all Portal BSS/EWCS facilities from Portal facilities collection
 *     tags: [Portal - BSS]
 *     description: Get all Portal BSS/EWCS facilities from Portal facilities collection
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/FacilitiesBSS'
 */
portalRouter.route('/facilities').get(getFacilitiesController.getAllPortalFacilities);

/**
 * @openapi
 * /portal/facilities:
 *   post:
 *     summary: Create a BSS/EWCS facility in Portal facilities collection
 *     tags: [Portal - BSS]
 *     description: Create a BSS/EWCS facility in Portal facilities collection
 *     requestBody:
 *       description: Fields required to create a facility.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               dealId:
 *                 type: string
 *           example:
 *             type: 'Bond'
 *             dealId: '123abc'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: '123456abc'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               validationErrors:
 *                 count: 2
 *                 errorList:
 *                   type:
 *                     order: '1'
 *                     text: 'Facility type must be Bond or Loan'
 *                   dealId:
 *                     order: '2'
 *                     text: 'Enter the Associated deal id'
 */
portalRouter.route('/facilities').post(createFacilityController.postBssFacility);

portalRouter.route('/multiple-facilities').post(createMultipleFacilitiesController.createMultipleFacilitiesPost);

/**
 * @openapi
 * /portal/facilities/:id:
 *   get:
 *     summary: Get a Portal BSS/EWCS facility
 *     tags: [Portal - BSS]
 *     description: Get a Portal BSS/EWCS facility
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Facility ID to get
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/FacilityBSS'
 *       404:
 *         description: Not found
 */
portalRouter.route('/facilities/:id').get(param('id').isMongoId(), hasValidationErrors, getFacilityController.findOneFacilityGet);

/**
 * @openapi
 * /portal/facilities/:id:
 *   put:
 *     summary: Update a Portal BSS/EWCS facility
 *     tags: [Portal - BSS]
 *     description: Update a Portal BSS/EWCS facility
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Facility ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: { aNewField: true }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/FacilityBSS'
 *                 - type: object
 *                   properties:
 *                     aNewField:
 *                       example: true
 *       404:
 *         description: Not found
 */
portalRouter.route('/facilities/:id').put(param('id').isMongoId(), hasValidationErrors, updateFacilityController.putBssFacility);

/**
 * @openapi
 * /portal/facilities/:id:
 *   delete:
 *     summary: Delete a Portal BSS/EWCS facility
 *     tags: [TFM]
 *     description: Delete a Portal BSS/EWCS facility by ID. Also updates the facilities array in the associated deal.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Facility ID to delete
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
 */
portalRouter.route('/facilities/:id').delete(param('id').isMongoId(), hasValidationErrors, deleteFacilityController.deleteFacility);

/**
 * @openapi
 * /portal/facilities/:id/status:
 *   put:
 *     summary: Update a Portal BSS/EWCS facility status
 *     tags: [Portal - BSS]
 *     description: Update a Portal BSS/EWCS facility status
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Facility ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: { status: Ready for Checker's approval }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/FacilityBSS'
 *                 - type: object
 *                   properties:
 *                     status:
 *                       example: Ready for Checker's approval
 *                     previousStatus:
 *                       example: Draft
 *       404:
 *         description: Not found
 */
portalRouter.route('/facilities/:id/status').put(param('id').isMongoId(), hasValidationErrors, updateFacilityStatusController.updateFacilityStatusPut);

/**
 * @openapi
 * /gef/deals:
 *   post:
 *     summary: Create a GEF deal in Portal deals collection
 *     tags: [Portal - GEF]
 *     description: Create a deal in Portal deals collection
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: '123456abc'
 */
portalRouter.route('/gef/deals').post(createDealController.postGefDeal);

/**
 * @openapi
 * /gef/deals/:id:
 *   get:
 *     summary: Get a GEF deal
 *     tags: [Portal - GEF]
 *     description: Get a GEF deal
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Deal ID to get
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/DealGEF'
 *       404:
 *         description: Not found
 */
portalRouter.route('/gef/deals/:id').get(param('id').isMongoId(), hasValidationErrors, getDealController.getOneGefDeal);

/**
 * @openapi
 * /portal/gef/deals/:id:
 *   put:
 *     summary: Update a Portal GEF deal
 *     tags: [Portal - GEF]
 *     description: Update a Portal GEF deal
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Deal ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               user: { _id: '123456abc' }
 *               dealUpdate: { aNewField: true }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/DealGEF'
 *                 - type: object
 *                   properties:
 *                     aNewField:
 *                       example: true
 *       404:
 *         description: Not found
 */
portalRouter.route('/gef/deals/:id').put(param('id').isMongoId(), hasValidationErrors, updateDealController.putGefDeal);

/**
 * @openapi
 * /gef/deals/activity/:id:
 *   put:
 *     summary: Create submission and facility activities from TFM-api for MIA->MIN
 *     tags: [Portal - GEF]
 *     description: Create GEF portal submission and facility activities for MIA->MIN as comes from TFM-api
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Deal ID to find deal and facilities and portalActivities to update
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/DealGEF'
 *       404:
 *         description: Not found
 */
portalRouter.route('/gef/deals/activity/:id').put(param('id').isMongoId(), hasValidationErrors, gefActivityController.generateMINActivities);

/**
 * @openapi
 * /gef/deals/:id/status:
 *   put:
 *     summary: Update a Portal GEF deal status
 *     tags: [Portal - GEF]
 *     description: Update a Portal GEF deal status
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Deal ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               status: UKEF_ACKNOWLEDGED
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/DealGEF'
 *                 - type: object
 *                   properties:
 *                     previousStatus:
 *                       example: Submitted
 *                     status:
 *                       example: Acknowledged
 *       404:
 *         description: Not found
 */
portalRouter.route('/gef/deals/:id/status').put(param('id').isMongoId(), hasValidationErrors, updateDealStatusController.putGefDealStatus);

/**
 * @openapi
 * /gef/deals/:id/comment:
 *   post:
 *     summary: Add a comment to a GEF deal in deals collection
 *     tags: [Portal - GEF]
 *     description: Add a comment to a GEF deal in deals collection
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Deal ID to add comment
 *     requestBody:
 *       description: Required fields
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentType:
 *                 type: string
 *                 example: 'comment'
 *               comment:
 *                 type: object
 *                 properties:
 *                   user:
 *                     type: object
 *                     schema:
 *                       $ref: '#/definitions/User'
 *                   text:
 *                     type: string
 *                     example: 'Amazing comment'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/DealGEF'
 *       404:
 *         description: Deal not found
 */
portalRouter.route('/gef/deals/:id/comment').post(param('id').isMongoId(), hasValidationErrors, addDealCommentController.postCommentToDeal);

/**
 * @openapi
 * /gef/deals/:id/facilites:
 *   get:
 *     summary: Get all Cash/Contingent facilities associated with a deal
 *     tags: [Portal - GEF]
 *     description: Get all facilities associated with a deal by deal ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Deal ID to get facilities for
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/FacilitiesGEF'
 */
portalRouter.route('/gef/deals/:id/facilities').get(param('id').isMongoId(), hasValidationErrors, getFacilitiesController.getAllGefFacilitiesByDealId);

/**
 * @openapi
 * /gef/facilities:
 *   post:
 *     summary: Create a Cash/Contingent facility in Portal facilities collection
 *     tags: [Portal - GEF]
 *     description: Create a facility in Portal facilities collection
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: '123456abc'
 *       404:
 *         description: Deal not found
 */
portalRouter.route('/gef/facilities').post(createFacilityController.postGefFacility);

/**
 * @openapi
 * /gef/facilities:
 *   get:
 *     summary: Return all facilities in facilities collection as an array
 *     tags: [Portal - GEF]
 *     description: Return all gef facilities
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *            application/json:
 *             schema:
 *                $ref: '#/definitions/FacilityGEF'
 */
portalRouter.route('/gef/facilities').get(getFacilitiesController.findAllGefFacilities);

/**
 * @openapi
 * /gef/facilities/:id:
 *   put:
 *     summary: Update a Portal GEF facility
 *     tags: [Portal - GEF]
 *     description: Update a Portal GEF facility
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Facility ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example: { aNewField: true }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/definitions/FacilityBSS'
 *                 - type: object
 *                   properties:
 *                     aNewField:
 *                       example: true
 *       404:
 *         description: Not found
 */
portalRouter.route('/gef/facilities/:id').put(param('id').isMongoId(), hasValidationErrors, updateFacilityController.putGefFacility);

/**
 * @openapi
 * /durable-functions:
 *   delete:
 *     summary: Deletes durable-functions-log
 *     tags: [DURABLE-FUNCTIONS-LOG]
 *     description: deletes durable-functions-log
 *     responses:
 *       200:
 *         description: OK
 *       210:
 *         description: FAILURE
 *
 */
portalRouter.route('/durable-functions').delete(durableFunctionsController.deleteAllDurableFunctions);

/**
 * @openapi
 * /cron-jobs:
 *   delete:
 *     summary: Delete all logs from cron-job-logs collection
 *     tags: [cron-job]
 *     description: Delete all logs from cron-job-logs collection, primarily eStore jobs
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Fail
 *
 */
portalRouter.route('/cron-jobs').delete(cronJobsController.deleteCronJobLogs);

// Mandatory Criteria
portalRouter.route('/mandatory-criteria/').post(query('dealType').not().isEmpty(), hasValidationErrors, mandatoryCriteria.postMandatoryCriteria);
portalRouter.route('/mandatory-criteria/').get(query('latest').toBoolean(), mandatoryCriteria.getMandatoryCriteria);
portalRouter.route('/mandatory-criteria/:version').get(query('dealType').not().isEmpty(), param('version').toInt().not().isEmpty(), hasValidationErrors, mandatoryCriteria.getOneMandatoryCriteria);
portalRouter.route('/mandatory-criteria/:version').put(query('dealType').not().isEmpty(), param('version').toInt().not().isEmpty(), hasValidationErrors, mandatoryCriteria.putMandatoryCriteria);
portalRouter.route('/mandatory-criteria/:version').delete(query('dealType').not().isEmpty(), param('version').toInt().not().isEmpty(), hasValidationErrors, mandatoryCriteria.deleteMandatoryCriteria);

// Eligibility Criteria
portalRouter.route('/eligibility-criteria/').post(query('dealType').not().isEmpty(), hasValidationErrors, eligibilityCriteria.postEligibilityCriteria);
portalRouter.route('/eligibility-criteria/').get(query('latest').toBoolean(), hasValidationErrors, eligibilityCriteria.getEligibilityCriteria);
portalRouter.route('/eligibility-criteria/:version').get(query('dealType').not().isEmpty(), param('version').toInt().not().isEmpty(), hasValidationErrors, eligibilityCriteria.getOneEligibilityCriteria);
portalRouter.route('/eligibility-criteria/:version').put(query('dealType').not().isEmpty(), param('version').toInt().not().isEmpty(), hasValidationErrors, eligibilityCriteria.putEligibilityCriteria);
portalRouter.route('/eligibility-criteria/:version').delete(query('dealType').not().isEmpty(), param('version').toInt().not().isEmpty(), hasValidationErrors, eligibilityCriteria.deleteEligibilityCriteria);

module.exports = portalRouter;
