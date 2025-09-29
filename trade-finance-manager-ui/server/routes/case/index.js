const express = require('express');
const { TEAM_IDS } = require('@ukef/dtfs2-common');
const caseController = require('../../controllers/case');
const partiesController = require('../../controllers/case/parties');
const underwritingController = require('../../controllers/case/underwriting');
const activityController = require('../../controllers/case/activity');
const amendmentsController = require('../../controllers/case/amendments');
const { validateUserTeam } = require('../../middleware');
const { cancellationRouter } = require('./cancellation');

const router = express.Router();

/**
 * @openapi
 * /:_id/deal:
 *   get:
 *     summary: Get the deal page
 *     tags: [TFM]
 *     description: Get the deal page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 */
router.route('/:_id/deal').get(caseController.getCaseDeal);

/**
 * @openapi
 * /:_id/tasks:
 *   get:
 *     summary: Get the deal tasks page
 *     tags: [TFM]
 *     description: Get the deal tasks page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post to filter deal tasks
 *     tags: [TFM]
 *     description: Post to filter deal tasks
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 */
router.route('/:_id/tasks').get(caseController.getCaseTasks).post(caseController.filterCaseTasks);

/**
 * @openapi
 * /:_id/tasks/:groupId/:taskId:
 *   get:
 *     summary: Get a deal task page
 *     tags: [TFM]
 *     description: Get a deal task page
 *     parameters:
 *       - in: path
 *         name: _id, groupId, taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, group ID and task ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post a deal task
 *     tags: [TFM]
 *     description: Post a deal task
 *     parameters:
 *       - in: path
 *         name: _id, groupId, taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, group ID and task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 */
router.route('/:_id/tasks/:groupId/:taskId').get(caseController.getCaseTask).post(caseController.putCaseTask);

/**
 * @openapi
 * /:_id/facility/:facilityId:
 *   get:
 *     summary: Get the facility page
 *     tags: [TFM]
 *     description: Get the facility page
 *     parameters:
 *       - in: path
 *         name: _id, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a facility amendment
 *     tags: [TFM - Amendments]
 *     description: Create a facility amendment
 *     parameters:
 *       - in: path
 *         name: _id, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router.route('/:_id/facility/:facilityId').get(caseController.getCaseFacility).post(caseController.postFacilityAmendment);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/request-date:
 *   get:
 *     summary: Get the amendment request date page
 *     tags: [TFM - Amendments]
 *     description: Get the amendment request date page
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post amendment request date
 *     tags: [TFM - Amendments]
 *     description: Post amendment request date
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/request-date')
  .get(amendmentsController.getAmendmentRequestDate)
  .post(amendmentsController.postAmendmentRequestDate);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/request-approval:
 *   get:
 *     summary: Get the amendment request approval page
 *     tags: [TFM - Amendments]
 *     description: Get the amendment request approval page
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post amendment request approval
 *     tags: [TFM - Amendments]
 *     description: Post amendment request approval
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/request-approval')
  .get(amendmentsController.getAmendmentRequestApproval)
  .post(amendmentsController.postAmendmentRequestApproval);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/amendment-options:
 *   get:
 *     summary: Get the amendment options page
 *     tags: [TFM - Amendments]
 *     description: Get the amendment options page
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post amendment options
 *     tags: [TFM - Amendments]
 *     description: Post amendment options
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/amendment-options')
  .get(amendmentsController.getAmendmentOptions)
  .post(amendmentsController.postAmendmentOptions);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/amendment-effective-date:
 *   get:
 *     summary: Get the amendment effective page
 *     tags: [TFM - Amendments]
 *     description: Get the amendment effective page
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: post amendment effective date
 *     tags: [TFM - Amendments]
 *     description: post amendment effective date
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/amendment-effective-date')
  .get(amendmentsController.getAmendmentEffectiveDate)
  .post(amendmentsController.postAmendmentEffectiveDate);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/lead-underwriter:
 *   get:
 *     summary: Get all underwriter/ managers and populates dropdown list
 *     tags: [TFM - Amendments]
 *     description: Get all underwriter/ managers and populates dropdown list
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post to check if unassigned or assigned to user
 *     tags: [TFM - Amendments]
 *     description: Post to check if unassigned or assigned to user
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/lead-underwriter')
  .get(amendmentsController.getAssignAmendmentLeadUnderwriter)
  .post(amendmentsController.postAssignAmendmentLeadUnderwriter);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/facility-value:
 *   get:
 *     summary: Get the amendment facility value page
 *     tags: [TFM - Amendments]
 *     description: Get the amendment facility value page
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post amendment facility value
 *     tags: [TFM - Amendments]
 *     description: Post amendment facility value
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/facility-value')
  .all(validateUserTeam([TEAM_IDS.PIM]))
  .get(amendmentsController.getAmendFacilityValue)
  .post(amendmentsController.postAmendFacilityValue);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/facility-value/managers-decision:
 *   get:
 *     summary: Get the amendment add managers decision facility value page
 *     tags: [TFM - Amendments]
 *     description: Get the amendment add managers decision facility value page
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post managers decision facility value
 *     tags: [TFM - Amendments]
 *     description: Post managers decision facility value
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/facility-value/managers-decision')
  .get(amendmentsController.getAmendmentAddUnderwriterManagersFacilityValue)
  .post(amendmentsController.postAmendmentAddUnderwriterManagersFacilityValue);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/cover-end-date:
 *   get:
 *     summary: Get the amendment cover end date page
 *     tags: [TFM - Amendments]
 *     description: Get the amendment cover end date page
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post amendment cover end date
 *     tags: [TFM - Amendments]
 *     description: Post amendment cover end date
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/cover-end-date')
  .all(validateUserTeam([TEAM_IDS.PIM]))
  .get(amendmentsController.getAmendCoverEndDate)
  .post(amendmentsController.postAmendCoverEndDate);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/is-using-facility-end-date:
 *   get:
 *     summary: Get the amendment is using facility end date page
 *     tags: [TFM - Amendments]
 *     description: Get the amendment is using facility end date page
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post if is using facility end date
 *     tags: [TFM - Amendments]
 *     description: Post if is using facility end date
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/is-using-facility-end-date')
  .all(validateUserTeam([TEAM_IDS.PIM]))
  .get(amendmentsController.getAmendmentIsUsingFacilityEndDate)
  .post(amendmentsController.postAmendmentIsUsingFacilityEndDate);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/facility-end-date:
 *   get:
 *     summary: Get the amendment facility end date page
 *     tags: [TFM - Amendments]
 *     description: Get the amendment facility end date page
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post the amendment facility end date
 *     tags: [TFM - Amendments]
 *     description: Post the amendment facility end date
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/facility-end-date')
  .all(validateUserTeam([TEAM_IDS.PIM]))
  .get(amendmentsController.getAmendmentFacilityEndDate)
  .post(amendmentsController.postAmendmentFacilityEndDate);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/bank-review-date:
 *   get:
 *     summary: Get the amendment bank review date page
 *     tags: [TFM - Amendments]
 *     description: Get the amendment bank review date page
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post the amendment bank review date
 *     tags: [TFM - Amendments]
 *     description: Post the amendment bank review date
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/bank-review-date')
  .all(validateUserTeam([TEAM_IDS.PIM]))
  .get(amendmentsController.getAmendmentBankReviewDate)
  .post(amendmentsController.postAmendmentBankReviewDate);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/cover-end-date/managers-decision:
 *   get:
 *     summary: Get the first page of amendment managers decision
 *     tags: [TFM - Amendments]
 *     description: Get the first page of amendment managers decision
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post amendment managers decision
 *     tags: [TFM - Amendments]
 *     description: Post amendment managers decision
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/cover-end-date/managers-decision')
  .get(amendmentsController.getAmendmentAddUnderwriterManagersDecisionCoverEndDate)
  .post(amendmentsController.postAmendmentAddUnderwriterManagersDecisionCoverEndDate);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/check-answers:
 *   get:
 *     summary: Get the amendment bank review date page
 *     tags: [TFM - Amendments]
 *     description: Get the amendment bank review date page
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post the amendment bank review date
 *     tags: [TFM - Amendments]
 *     description: Post the amendment bank review date
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/check-answers')
  .all(validateUserTeam([TEAM_IDS.PIM]))
  .get(amendmentsController.getAmendmentAnswers)
  .post(amendmentsController.postAmendmentAnswers);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/managers-conditions:
 *   get:
 *     summary: Get managers conditions and comments page
 *     tags: [TFM - Amendments]
 *     description: Get managers conditions and comments page
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post managers conditions and comments
 *     tags: [TFM - Amendments]
 *     description: Post managers conditions and comments
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/managers-conditions')
  .get(amendmentsController.getManagersConditionsAndComments)
  .post(amendmentsController.postManagersConditionsAndComments);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/managers-conditions/summary:
 *   get:
 *     summary: Get managers conditions and comments summary page
 *     tags: [TFM - Amendments]
 *     description: Get managers conditions and comments summary page
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post managers conditions and comments summary
 *     tags: [TFM - Amendments]
 *     description: Post managers conditions and comments summary
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/managers-conditions/summary')
  .get(amendmentsController.getManagersConditionsAndCommentsSummary)
  .post(amendmentsController.postManagersConditionsAndCommentsSummary);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/banks-decision:
 *   get:
 *     summary: Get the first page of amendment banks decision
 *     tags: [TFM - Amendments]
 *     description: Get the first page of amendment banks decision
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post date that decision was received
 *     tags: [TFM - Amendments]
 *     description: Post date that decision was received
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision')
  .get(amendmentsController.getAmendmentBankDecisionChoice)
  .post(amendmentsController.postAmendmentBankDecisionChoice);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/received-date:
 *   get:
 *     summary: Get the first page of amendment banks decision
 *     tags: [TFM - Amendments]
 *     description: Get the first page of amendment banks decision
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post date that decision was received
 *     tags: [TFM - Amendments]
 *     description: Post date that decision was received
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/received-date')
  .get(amendmentsController.getAmendmentBankDecisionReceivedDate)
  .post(amendmentsController.postAmendmentBankDecisionReceivedDate);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/effective-date:
 *   get:
 *     summary: Get the effective date for banks decision page
 *     tags: [TFM - Amendments]
 *     description: Get the effective date for banks decision page
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post the effective date of bank decision
 *     tags: [TFM - Amendments]
 *     description: Post the effective date of bank decision
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/effective-date')
  .get(amendmentsController.getAmendmentBankDecisionEffectiveDate)
  .post(amendmentsController.postAmendmentBankDecisionEffectiveDate);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/check-answers:
 *   get:
 *     summary: Get check your answers page for bank decision
 *     tags: [TFM - Amendments]
 *     description: Get check your answers page for bank decision
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post bank decision answers
 *     tags: [TFM - Amendments]
 *     description: Post bank decision answers
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/check-answers')
  .get(amendmentsController.getAmendmentBankDecisionAnswers)
  .post(amendmentsController.postAmendmentBankDecisionAnswers);

/**
 * @openapi
 * /:_id/facility/:facilityId/amendment/:amendmentId/task/:taskId/group/:groupId:
 *   get:
 *     summary: Get amendment task page
 *     tags: [TFM - Amendments]
 *     description: Get amendment task page
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId, taskId, groupId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID, amendment ID, task ID and group ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post an amendment task
 *     tags: [TFM - Amendments]
 *     description: Post an amendment task
 *     parameters:
 *       - in: path
 *         name: _id, facilityId, amendmentId, taskId, groupId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID, amendment ID, task ID and group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router
  .route('/:_id/facility/:facilityId/amendment/:amendmentId/task/:taskId/group/:groupId')
  .get(amendmentsController.getAmendmentTask)
  .post(amendmentsController.postAmendmentTask);

/**
 * @openapi
 * /:_id/parties:
 *   get:
 *     summary: Get all parties URN page
 *     tags: [TFM]
 *     description: Get all parties URN page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 */
router.route('/:_id/parties').get(partiesController.getAllParties);

/**
 * @openapi
 * /:_id/parties/exporter:
 *   get:
 *     summary: Get party specific URN edit page
 *     tags: [TFM]
 *     description: Get party specific URN edit page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post party URN to the summary page for confirmation
 *     tags: [TFM]
 *     description: Post party URN to the summary page for confirmation
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router.route('/:_id/parties/exporter').get(partiesController.getPartyDetails).post(partiesController.confirmPartyUrn);

/**
 * @openapi
 * /:_id/parties/exporter/summary/:urn:
 *   get:
 *     summary: Get party specific urn summary page
 *     tags: [TFM]
 *     description: Get party specific urn summary page
 *     parameters:
 *       - in: path
 *         name: _id, urn
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and urn
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Submits confirmed party URN to the TFM
 *     tags: [TFM]
 *     description: Submits confirmed party URN to the TFM
 *     parameters:
 *       - in: path
 *         name: _id, urn
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and urn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router.route('/:_id/parties/exporter/summary/:urn').get(partiesController.getPartyUrnDetails).post(partiesController.postPartyDetails);

/**
 * @openapi
 * /:_id/parties/buyer:
 *   get:
 *     summary: Get party specific urn summary page
 *     tags: [TFM]
 *     description: Get party specific urn summary page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post party URN to the summary page for confirmation
 *     tags: [TFM]
 *     description: Post party URN to the summary page for confirmation
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router.route('/:_id/parties/buyer').get(partiesController.getPartyDetails).post(partiesController.confirmPartyUrn);

/**
 * @openapi
 * /:_id/parties/buyer/summary/:urn:
 *   get:
 *     summary: Get party specific urn summary page
 *     tags: [TFM]
 *     description: Get party specific urn summary page
 *     parameters:
 *       - in: path
 *         name: _id, urn
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and the urn
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Submits confirmed party URN to the TFM
 *     tags: [TFM]
 *     description: Submits confirmed party URN to the TFM
 *     parameters:
 *       - in: path
 *         name: _id, urn
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and the urn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router.route('/:_id/parties/buyer/summary/:urn').get(partiesController.getPartyUrnDetails).post(partiesController.postPartyDetails);

/**
 * @openapi
 * /:_id/parties/agent:
 *   get:
 *     summary: Get party specific URN edit page
 *     tags: [TFM]
 *     description: Get party specific URN edit page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post party URN to the summary page for confirmation
 *     tags: [TFM]
 *     description: Post party URN to the summary page for confirmation
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router.route('/:_id/parties/agent').get(partiesController.getPartyDetails).post(partiesController.confirmPartyUrn);

/**
 * @openapi
 * /:_id/parties/agent/summary/:urn:
 *   get:
 *     summary: Get party specific urn summary page
 *     tags: [TFM]
 *     description: Get party specific urn summary page
 *     parameters:
 *       - in: path
 *         name: _id, urn
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and the urn
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Submits confirmed party URN to the TFM
 *     tags: [TFM]
 *     description: Submits confirmed party URN to the TFM
 *     parameters:
 *       - in: path
 *         name: _id, urn
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and the urn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router.route('/:_id/parties/agent/summary/:urn').get(partiesController.getPartyUrnDetails).post(partiesController.postPartyDetails);

/**
 * @openapi
 * /:_id/parties/indemnifier:
 *   get:
 *     summary: Get party specific URN edit page
 *     tags: [TFM]
 *     description: Get party specific URN edit page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post party URN to the summary page for confirmation
 *     tags: [TFM]
 *     description: Post party URN to the summary page for confirmation
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router.route('/:_id/parties/indemnifier').get(partiesController.getPartyDetails).post(partiesController.confirmPartyUrn);

/**
 * @openapi
 * /:_id/parties/indemnifier/summary/:urn:
 *   get:
 *     summary: Get party specific urn summary page
 *     tags: [TFM]
 *     description: Get party specific urn summary page
 *     parameters:
 *       - in: path
 *         name: _id, urn
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and the urn
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Submits confirmed party URN to the TFM
 *     tags: [TFM]
 *     description: Submits confirmed party URN to the TFM
 *     parameters:
 *       - in: path
 *         name: _id, urn
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and the urn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router.route('/:_id/parties/indemnifier/summary/:urn').get(partiesController.getPartyUrnDetails).post(partiesController.postPartyDetails);

/**
 * @openapi
 * /:_id/parties/bond-issuer:
 *   get:
 *     summary: Get party specific URN edit page
 *     tags: [TFM]
 *     description: Get party specific URN edit page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post party URNs to bond summary page for confirmation
 *     tags: [TFM]
 *     description: Post party URNs to bond summary page for confirmation
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
router.route('/:_id/parties/bond-issuer').get(partiesController.getPartyDetails).post(caseController.confirmTfmFacility);

router.route('/:_id/parties/bond-issuer/summary').get(partiesController.getBondUrnDetails).post(caseController.postTfmFacility);

router.route('/:_id/parties/bond-beneficiary').get(partiesController.getPartyDetails).post(caseController.confirmTfmFacility);

router.route('/:_id/parties/bond-beneficiary/summary').get(partiesController.getBondUrnDetails).post(caseController.postTfmFacility);

router.route('/:_id/activity').get(activityController.getActivity).post(activityController.filterActivities);

router.route('/:_id/activity/post-comment').get(activityController.getCommentBox).post(activityController.postComment);

router.route('/:_id/underwriting').get(underwritingController.getUnderwriterPage);

router
  .route('/:_id/underwriting/pricing-and-risk/edit')
  .get(underwritingController.getUnderWritingPricingAndRiskEdit)
  .post(underwritingController.postUnderWritingPricingAndRisk);

router
  .route('/:_id/underwriting/pricing-and-risk/loss-given-default')
  .get(underwritingController.getUnderWritingLossGivenDefault)
  .post(underwritingController.postUnderWritingLossGivenDefault);

router
  .route('/:_id/underwriting/pricing-and-risk/probability-of-default')
  .get(underwritingController.getUnderWritingProbabilityOfDefault)
  .post(underwritingController.postUnderWritingProbabilityOfDefault);

router
  .route('/:_id/underwriting/pricing-and-risk/facility/:facilityId/risk-profile')
  .get(underwritingController.getUnderWritingFacilityRiskProfileEdit)
  .post(underwritingController.postUnderWritingFacilityRiskProfileEdit);

router
  .route('/:_id/underwriting/lead-underwriter/assign')
  .get(underwritingController.getAssignLeadUnderwriter)
  .post(underwritingController.postAssignLeadUnderwriter);

router
  .route('/:_id/underwriting/managers-decision/edit')
  .get(underwritingController.getUnderwriterManagersDecisionEdit)
  .post(underwritingController.postUnderwriterManagersDecision);

router.route('/:_id/documents').get(caseController.getCaseDocuments);

router.use('/', cancellationRouter);

module.exports = router;
