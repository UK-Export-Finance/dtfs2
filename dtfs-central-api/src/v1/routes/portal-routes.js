const express = require('express');
const { validatePortalFacilityAmendmentsEnabled } = require('@ukef/dtfs2-common');
const validation = require('../validation/route-validators/route-validators');
const { validatePutPortalFacilityAmendmentPayload } = require('./middleware/payload-validation/validate-put-portal-facility-amendment-payload');
const { validatePatchPortalFacilityAmendmentPayload } = require('./middleware/payload-validation/validate-patch-portal-facility-amendment-payload');
const { validateDeletePortalFacilityAmendmentPayload } = require('./middleware/payload-validation/validate-delete-portal-facility-amendment-payload');
const {
  validatePatchPortalFacilityAmendmentStatusPayload,
} = require('./middleware/payload-validation/validate-patch-portal-facility-amendment-status-payload');

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

const createGefDealController = require('../controllers/portal/gef-deal/create-gef-deal.controller');
const getGefDealController = require('../controllers/portal/gef-deal/get-gef-deal.controller');
const updateGefDealController = require('../controllers/portal/gef-deal/update-deal.controller');
const putGefDealStatusController = require('../controllers/portal/gef-deal/put-gef-deal.status.controller');
const addCommentToGefDeal = require('../controllers/portal/gef-deal/add-underwriter-comment-gef.controller');
const gefActivityController = require('../controllers/portal/gef-deal/add-min-activities.controller');

const getGefFacilitiesController = require('../controllers/portal/gef-facility/get-facilities.controller');
const createGefFacilityController = require('../controllers/portal/gef-facility/create-gef-facility.controller');
const updateGefFacilityController = require('../controllers/portal/gef-facility/update-facility.controller');

const getFacilityAmendmentController = require('../controllers/portal/facility/get-amendment.controller');
const putFacilityAmendmentController = require('../controllers/portal/facility/put-amendment.controller');
const patchFacilityAmendmentController = require('../controllers/portal/facility/patch-amendment.controller');
const deleteFacilityAmendmentController = require('../controllers/portal/facility/delete-amendment.controller');
const patchAmendmentStatusController = require('../controllers/portal/facility/patch-amendment-status.controller');

const getAllFacilityAmendmentController = require('../controllers/portal/facility/get-all-amendments.controller');
const getFacilityAmendmentsForDealController = require('../controllers/portal/facility/get-amendments-on-deal.controller');

const durableFunctionsController = require('../controllers/durable-functions/durable-functions.controller');
const cronJobsController = require('../controllers/cron-jobs/cron-jobs.controller');

const mandatoryCriteria = require('../controllers/portal/mandatory-criteria/mandatory-criteria.controller');

const { ROUTES } = require('../../constants');

portalRouter.use((req, res, next) => {
  req.routePath = ROUTES.PORTAL_ROUTE;
  next();
});

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
 *               user:
 *                 type: object
 *               deal:
 *                 type: object
 *                 properties:
 *                   details:
 *                     type: object
 *               auditDetails:
 *                 type: object
 *                 $ref: '#/definitions/PortalAuditDetails'
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
portalRouter.route('/deals').post(createDealController.createDealPost);

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
portalRouter.route('/deals/:id').get(getDealController.findOneDealGet);

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
 *             properties:
 *               dealUpdate:
 *                 type: object
 *               user:
 *                 type: object
 *               auditDetails:
 *                 type: object
 *                 $ref: '#/definitions/PortalAuditDetails'
 *             example:
 *               user: { _id: '123456abc' }
 *               dealUpdate: { aNewField: true }
 *               auditDetails: { userType: 'portal', id: 'abcdef123456abcdef123456' }
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
portalRouter.route('/deals/:id').put(updateDealController.updateDealPut);

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
portalRouter.route('/deals/:id').delete(deleteDealController.deleteDeal);

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
portalRouter.route('/deals/:id/status').put(updateDealStatusController.updateDealStatusPut);

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
 *                     $ref: '#/definitions/User'
 *                   auditDetails:
 *                     type: object
 *                     $ref: '#/definitions/PortalAuditDetails'
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
portalRouter.route('/deals/:id/comment').post(addDealCommentController.addDealCommentPost);

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
portalRouter.route('/facilities').get(getFacilitiesController.findAllGet);

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
 *               auditDetails:
 *                 type: object
 *                 $ref: '#/definitions/PortalAuditDetails'
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
portalRouter.route('/facilities').post(createFacilityController.createFacilityPost);

portalRouter.route('/multiple-facilities').post(createMultipleFacilitiesController.createMultipleFacilitiesPost);

/**
 * @openapi
 * /facilities/amendments:
 *   get:
 *     summary: Get all the Portal facility amendments
 *     tags: [Portal - Amendments]
 *     description: Get all the Portal facility amendments
 *     parameters:
 *       - in: query
 *         name: statuses
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ['Draft']
 *         required: false
 *         description: The portal amendment statuses to filter on
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/definitions/PortalAmendment'
 *       500:
 *         description: Internal server error
 */
portalRouter.route('/facilities/amendments').get(getAllFacilityAmendmentController.getAllPortalAmendments);

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
portalRouter.route('/facilities/:id').get(getFacilityController.findOneFacilityGet);

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
 *             properties:
 *               facilityUpdate:
 *                 type: object
 *               user:
 *                 type: object
 *               auditDetails:
 *                 type: object
 *                 $ref: '#/definitions/portalAuditDetails'
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
portalRouter.route('/facilities/:id').put(updateFacilityController.updateFacilityPut);

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
portalRouter.route('/facilities/:id').delete(deleteFacilityController.deleteFacility);

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
 *           properties:
 *             status:
 *               type: string
 *             auditDetails:
 *               type: object
 *               $ref: '#/definitions/portalAuditDetails'
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
portalRouter.route('/facilities/:id/status').put(updateFacilityStatusController.updateFacilityStatusPut);

/**
 * @openapi
 * /facilities/:facilityId/amendments/:amendmentId:
 *   get:
 *     summary: Get a Portal facility amendment
 *     tags: [Portal - Amendments]
 *     description: Get a Portal facility amendment
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: Facility ID amendment exists on
 *       - in: path
 *         name: amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: Amendment ID to get
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/definitions/PortalAmendment'
 *       404:
 *         description: Not found
 *   patch:
 *     summary: Update a Portal GEF facility amendment
 *     tags: [Portal - Amendments]
 *     description: Update a Portal GEF facility amendment
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: Facility ID amendment should exist on
 *       - in: path
 *         name: amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: Amendment ID to get
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               update:
 *                 type: object
 *                 $ref: '#/definitions/PortalAmendmentUserInput'
 *               auditDetails:
 *                 type: object
 *                 $ref: '#/definitions/PortalAuditDetails'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/definitions/PortalAmendment'
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete a Portal GEF facility amendment
 *     tags: [Portal - Amendments]
 *     description: Delete a Portal GEF facility amendment
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: Facility ID amendment should exist on
 *       - in: path
 *         name: amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: Amendment ID to get
 *     responses:
 *       204:
 *         description: No content
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
portalRouter
  .route('/facilities/:facilityId/amendments/:amendmentId')
  .all(validatePortalFacilityAmendmentsEnabled, validation.mongoIdValidation('facilityId'), validation.mongoIdValidation('amendmentId'))
  .get(getFacilityAmendmentController.getAmendment)
  .patch(validatePatchPortalFacilityAmendmentPayload, patchFacilityAmendmentController.patchAmendment)
  .delete(validateDeletePortalFacilityAmendmentPayload, deleteFacilityAmendmentController.deletePortalAmendment);

/**
 * @openapi
 * /facilities/:facilityId/amendments/:amendmentId:/status:
 *   patch:
 *     summary: update a Portal GEF facility amendment status
 *     tags: [Portal - Amendments]
 *     description: update a Portal GEF facility amendment status
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: Facility ID amendment should exist on
 *       - in: path
 *         name: amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: Amendment ID to get
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               auditDetails:
 *                 type: object
 *                 $ref: '#/definitions/PortalAuditDetails'
 *               newStatus:
 *                  type: string
 *                  enum: ["Ready for checker's approval"]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/definitions/PortalAmendment'
 *       404:
 *         description: Not found
 *       409:
 *         description: Conflict - amendment cannot currently be updated to the given status
 */
portalRouter
  .route('/facilities/:facilityId/amendments/:amendmentId/status')
  .patch(
    validatePortalFacilityAmendmentsEnabled,
    validation.mongoIdValidation('facilityId'),
    validation.mongoIdValidation('amendmentId'),
    validatePatchPortalFacilityAmendmentStatusPayload,
    patchAmendmentStatusController.patchAmendmentStatus,
  );

/**
 * @openapi
 * /facilities/:facilityId/amendments:
 *   put:
 *     summary: upsert a Portal facility amendment
 *     tags: [Portal - Amendments]
 *     description: Upsert a Portal facility amendment
 *     parameters:
 *       - in: path
 *         name: facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: Facility ID amendment should exist on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dealId:
 *                type: string
 *                example: '123456abcdef123456abcdef'
 *               amendment:
 *                 type: object
 *                 $ref: '#/definitions/PortalAmendmentUserInput'
 *               auditDetails:
 *                 type: object
 *                 $ref: '#/definitions/PortalAuditDetails'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/definitions/PortalAmendment'
 *       404:
 *         description: Not found
 *       409:
 *         description: Conflict
 */
portalRouter
  .route('/facilities/:facilityId/amendments')
  .all(validatePortalFacilityAmendmentsEnabled, validation.mongoIdValidation('facilityId'))
  .put(validatePutPortalFacilityAmendmentPayload, putFacilityAmendmentController.putAmendmentDraft);

/**
 * @openapi
 * /deals/:dealId/amendments:
 *   get:
 *     summary: Get all the Portal facility amendments on a given deal
 *     tags: [Portal - Amendments]
 *     description: Get all the Portal facility amendments on a given deal
 *     parameters:
 *       - in: path
 *         name: dealId
 *         schema:
 *           type: string
 *         required: true
 *         description: Deal ID to get amendments for
 *       - in: query
 *         name: statuses
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           example: ['Draft']
 *         required: false
 *         description: The portal amendment statuses to filter on
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/definitions/PortalAmendment'
 *       404:
 *         description: Not found
 */
portalRouter
  .route('/deals/:dealId/amendments')
  .all(validation.mongoIdValidation('dealId'))
  .get(getFacilityAmendmentsForDealController.getPortalAmendmentsOnDeal);

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
portalRouter.route('/gef/deals').post(createGefDealController.createDealPost);

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
portalRouter.route('/gef/deals/:id').get(getGefDealController.findOneDealGet);

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
portalRouter.route('/gef/deals/:id').put(updateGefDealController.updateDealPut);

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
portalRouter.route('/gef/deals/activity/:id').put(gefActivityController.generateMINActivities);

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
portalRouter.route('/gef/deals/:id/status').put(putGefDealStatusController.updateDealStatusPut);

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
portalRouter.route('/gef/deals/:id/comment').post(addCommentToGefDeal.addUnderwriterCommentToGefDeal);

/**
 * @openapi
 * /gef/deals/:id/facilities:
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
portalRouter.route('/gef/deals/:id/facilities').get(getGefFacilitiesController.findAllGet);

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
portalRouter.route('/gef/facilities').post(createGefFacilityController.createFacilityPost);

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
portalRouter.route('/gef/facilities').get(getGefFacilitiesController.findAllFacilities);

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
portalRouter.route('/gef/facilities/:id').put(updateGefFacilityController.updateFacilityPut);

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
portalRouter.route('/cron-jobs').delete(cronJobsController.deleteAllEstoreLogs);

portalRouter.route('/gef/mandatory-criteria/latest').get(mandatoryCriteria.getLatestGefMandatoryCriteria);
portalRouter.route('/gef/mandatory-criteria/version/:version').get(mandatoryCriteria.getGefMandatoryCriteriaByVersion);

module.exports = portalRouter;
