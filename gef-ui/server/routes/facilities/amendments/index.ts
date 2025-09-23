/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { validateMongoId } from '@ukef/dtfs2-common';
import { validatePortalFacilityAmendmentsEnabled } from '../../../middleware/feature-flags/portal-facility-amendments';
import { validateRole, validateToken, validateBank, validateDealStatusForAmendment } from '../../../middleware';
import { MAKER, CHECKER } from '../../../constants/roles';
import { postCreateDraftFacilityAmendment } from '../../../controllers/amendments/create-draft/post-create-draft';
import { getWhatNeedsToChange } from '../../../controllers/amendments/what-needs-to-change/get-what-needs-to-change';
import { postWhatNeedsToChange } from '../../../controllers/amendments/what-needs-to-change/post-what-needs-to-change';
import { getFacilityValue } from '../../../controllers/amendments/facility-value/get-facility-value';
import { postFacilityValue } from '../../../controllers/amendments/facility-value/post-facility-value';
import { getCoverEndDate } from '../../../controllers/amendments/cover-end-date/get-cover-end-date';
import { postCoverEndDate } from '../../../controllers/amendments/cover-end-date/post-cover-end-date';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { getCancelPortalFacilityAmendment } from '../../../controllers/amendments/cancel-amendment/get-cancel-portal-facility-amendment';
import { postCancelPortalFacilityAmendment } from '../../../controllers/amendments/cancel-amendment/post-cancel-portal-facility-amendment';
import { getDoYouHaveAFacilityEndDate } from '../../../controllers/amendments/do-you-have-a-facility-end-date/get-do-you-have-a-facility-end-date';
import { postDoYouHaveAFacilityEndDate } from '../../../controllers/amendments/do-you-have-a-facility-end-date/post-do-you-have-a-facility-end-date';
import { getFacilityEndDate } from '../../../controllers/amendments/facility-end-date/get-facility-end-date';
import { postFacilityEndDate } from '../../../controllers/amendments/facility-end-date/post-facility-end-date';
import { getBankReviewDate } from '../../../controllers/amendments/bank-review-date/get-bank-review-date';
import { postBankReviewDate } from '../../../controllers/amendments/bank-review-date/post-bank-review-date';
import { getEligibility } from '../../../controllers/amendments/eligibility-criteria/get-eligibility';
import { postEligibility } from '../../../controllers/amendments/eligibility-criteria/post-eligibility';
import { getEffectiveDate } from '../../../controllers/amendments/effective-date/get-effective-date';
import { postEffectiveDate } from '../../../controllers/amendments/effective-date/post-effective-date';
import { getManualApprovalNeeded } from '../../../controllers/amendments/manual-approval-needed/get-manual-approval-needed';
import { getCheckYourAnswers } from '../../../controllers/amendments/check-your-answers/get-check-your-answers';
import { postCheckYourAnswers } from '../../../controllers/amendments/check-your-answers/post-check-your-answers';
import { getSubmittedForChecking } from '../../../controllers/amendments/submitted-for-checking/get-submitted-for-checking';
import { getApprovedByUkef } from '../../../controllers/amendments/approved-by-ukef/get-approved-by-ukef';
import { getAmendmentDetails } from '../../../controllers/amendments/amendment-details/get-amendment-details';
import { getSubmitAmendmentToUkef } from '../../../controllers/amendments/submit-amendment-to-ukef/get-submit-amendment-to-ukef';
import { postSubmitAmendmentToUkef } from '../../../controllers/amendments/submit-amendment-to-ukef/post-submit-amendment-to-ukef';
import { getApplicationAmendments } from '../../../controllers/amendments/application-amendments/get-application-amendments';
import { getReturnAmendmentToMaker } from '../../../controllers/amendments/return-amendment-to-maker/get-return-amendment-to-maker';
import { getReturnedToMaker } from '../../../controllers/amendments/returned-to-maker/get-returned-to-maker';
import { postReturnAmendmentToMaker } from '../../../controllers/amendments/return-amendment-to-maker/post-return-amendment-to-maker';
import { getAbandonPortalFacilityAmendment } from '../../../controllers/amendments/abandon-amendment/get-abandon-portal-facility-amendment';
import { postAbandonPortalFacilityAmendment } from '../../../controllers/amendments/abandon-amendment/post-abandon-portal-facility-amendment';

const {
  WHAT_DO_YOU_NEED_TO_CHANGE,
  COVER_END_DATE,
  FACILITY_VALUE,
  DO_YOU_HAVE_A_FACILITY_END_DATE,
  FACILITY_END_DATE,
  BANK_REVIEW_DATE,
  ELIGIBILITY,
  MANUAL_APPROVAL_NEEDED,
  EFFECTIVE_DATE,
  CHECK_YOUR_ANSWERS,
  CANCEL,
  SUBMITTED_FOR_CHECKING,
  APPROVED_BY_UKEF,
  AMENDMENT_DETAILS,
  SUBMIT_AMENDMENT_TO_UKEF,
  ALL_TYPES_AMENDMENTS,
  RETURN_TO_MAKER,
  RETURNED_TO_MAKER,
  ABANDON,
} = PORTAL_AMENDMENT_PAGES;

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/create-draft/:
 *   post:
 *     summary: Overwrite draft amendment on facility
 *     tags: [Portal - Amendments]
 *     description: Overwrite draft amendment on facility
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: deal ID and facility ID for the amendment
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/create-draft/`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .post(postCreateDraftFacilityAmendment);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${WHAT_DO_YOU_NEED_TO_CHANGE}/:
 *   get:
 *     summary: Get the `What needs to change` page
 *     tags: [Portal - Amendments]
 *     description: Get the `What needs to change` page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       302:
 *         description: Resource temporary moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Update what needs to change on the amendment
 *     tags: [Portal - Amendments]
 *     description: Update what needs to change on the amendment
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amendmentOptions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of options selected by the user indicating what they want to change in the amendment
 *           example: ['changeCoverEndDate', 'changeFacilityValue']
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${WHAT_DO_YOU_NEED_TO_CHANGE}/`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getWhatNeedsToChange)
  .post(postWhatNeedsToChange);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${FACILITY_VALUE}/:
 *   get:
 *     summary: Get the facility value page
 *     tags: [Portal - Amendments]
 *     description: Get the facility value page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       302:
 *         description: Resource temporary moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post the facility value
 *     tags: [Portal - Amendments]
 *     description: Post the facility value
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               facilityValue:
 *                 type: number
 *                 description: The new facility value
 *               previousPage:
 *                 type: string
 *                 description: The previous page URL
 *           example:
 *             facilityValue: 1000000
 *             previousPage: '/gef/application-details/12345'
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${FACILITY_VALUE}/`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getFacilityValue)
  .post(postFacilityValue);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${COVER_END_DATE}/:
 *   get:
 *     summary: Get the cover end date page
 *     tags: [Portal - Amendments]
 *     description: Get the cover end date page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       302:
 *         description: Resource temporary moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post the cover end date
 *     tags: [Portal - Amendments]
 *     description: Post the cover end date
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cover-end-date-day:
 *                 type: string
 *                 description: The day part of the cover end date
 *               cover-end-date-month:
 *                 type: string
 *                 description: The month part of the cover end date
 *               cover-end-date-year:
 *                 type: string
 *                 description: The year part of the cover end date
 *               previousPage:
 *                 type: string
 *                 description: The previous page URL
 *           example:
 *             cover-end-date-day: '01'
 *             cover-end-date-month: '01'
 *             cover-end-date-year: '2025'
 *             previousPage: '/gef/application-details/12345'
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${COVER_END_DATE}/`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getCoverEndDate)
  .post(postCoverEndDate);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${CANCEL}:
 *   get:
 *     summary: Get the cancel amendment page
 *     tags: [Portal - Amendments]
 *     description: Get the cancel amendment page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       302:
 *         description: Resource temporary moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post the cancel amendment page
 *     tags: [Portal - Amendments]
 *     description: Post the cancel amendment page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${CANCEL}`)
  .all([
    validatePortalFacilityAmendmentsEnabled,
    validateToken,
    validateBank,
    validateMongoId('dealId'),
    validateMongoId('facilityId'),
    validateMongoId('amendmentId'),
    validateDealStatusForAmendment,
    validateRole({ role: [MAKER] }),
  ])
  .get(getCancelPortalFacilityAmendment)
  .post(postCancelPortalFacilityAmendment);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${DO_YOU_HAVE_A_FACILITY_END_DATE}:
 *   get:
 *     summary: Get the `Do you have a facility end date` page
 *     tags: [Portal - Amendments]
 *     description: Get the `Do you have a facility end date` page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       302:
 *         description: Resource temporary moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Update the isUsingFacilityEndDate value
 *     tags: [Portal - Amendments]
 *     description: Update the isUsingFacilityEndDate value
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isUsingFacilityEndDate:
 *                 type: boolean
 *                 description: The user's answer to whether they have a facility end date (true/false)
 *               previousPage:
 *                 type: string
 *                 description: The previous page URL
 *           example:
 *             isUsingFacilityEndDate: true
 *             previousPage: '/gef/application-details/12345'
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${DO_YOU_HAVE_A_FACILITY_END_DATE}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getDoYouHaveAFacilityEndDate)
  .post(postDoYouHaveAFacilityEndDate);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${FACILITY_END_DATE}:
 *   get:
 *     summary: Get the `Facility end date` page
 *     tags: [Portal - Amendments]
 *     description: Get the `Facility end date` page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       302:
 *         description: Resource temporary moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post the `Facility end date` page
 *     tags: [Portal - Amendments]
 *     description: Post the `Facility end date` page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               facility-end-date-day:
 *                 type: string
 *                 description: The day part of the facility end date
 *               facility-end-date-month:
 *                 type: string
 *                 description: The month part of the facility end date
 *               facility-end-date-year:
 *                 type: string
 *                 description: The year part of the facility end date
 *               previousPage:
 *                 type: string
 *                 description: The previous page URL
 *           example:
 *             facility-end-date-day: '01'
 *             facility-end-date-month: '01'
 *             facility-end-date-year: '2025'
 *             previousPage: '/gef/application-details/12345'
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${FACILITY_END_DATE}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getFacilityEndDate)
  .post(postFacilityEndDate);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${BANK_REVIEW_DATE}:
 *   get:
 *     summary: Get the `Bank review date` page
 *     tags: [Portal - Amendments]
 *     description: Get the `Bank review date` page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       302:
 *         description: Resource temporary moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post the `Bank review date` page
 *     tags: [Portal - Amendments]
 *     description: Post the `Bank review date` page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bank-review-date-day:
 *                 type: string
 *                 description: The day part of the bank review date
 *               bank-review-date-month:
 *                 type: string
 *                 description: The month part of the bank review date
 *               bank-review-date-year:
 *                 type: string
 *                 description: The year part of the bank review date
 *               previousPage:
 *                 type: string
 *                 description: The previous page URL
 *           example:
 *             bank-review-date-day: '01'
 *             bank-review-date-month: '01'
 *             bank-review-date-year: '2025'
 *             previousPage: '/gef/application-details/12345'
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${BANK_REVIEW_DATE}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getBankReviewDate)
  .post(postBankReviewDate);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${ELIGIBILITY}:
 *   get:
 *     summary: Get the `Eligibility` page
 *     tags: [Portal - Amendments]
 *     description: Get the `Eligibility` page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       302:
 *         description: Resource temporary moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post eligibility criteria responses
 *     tags: [Portal - Amendments]
 *     description: Post eligibility criteria responses
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${ELIGIBILITY}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getEligibility)
  .post(postEligibility);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${MANUAL_APPROVAL_NEEDED}:
 *   get:
 *     summary: Get the manual approval needed amendment page
 *     tags: [Portal - Amendments]
 *     description: Get the manual approval needed amendment page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       302:
 *         description: Resource temporary moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${MANUAL_APPROVAL_NEEDED}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getManualApprovalNeeded);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${EFFECTIVE_DATE}:
 *   get:
 *     summary: Get the `Effective date` page
 *     tags: [Portal - Amendments]
 *     description: Get the `Effective date` page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       302:
 *         description: Resource temporary moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post the `Date amendment effective from` page
 *     tags: [Portal - Amendments]
 *     description: Post the `Date amendment effective from` page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               effective-date-day:
 *                 type: string
 *                 description: The day part of the effective date
 *               effective-date-month:
 *                 type: string
 *                 description: The month part of the effective date
 *               effective-date-year:
 *                 type: string
 *                 description: The year part of the effective date
 *               previousPage:
 *                 type: string
 *                 description: The previous page URL
 *           example:
 *             effective-date-day: '01'
 *             effective-date-month: '01'
 *             effective-date-year: '2025'
 *             previousPage: '/gef/application-details/12345'
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${EFFECTIVE_DATE}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getEffectiveDate)
  .post(postEffectiveDate);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${CHECK_YOUR_ANSWERS}:
 *   get:
 *     summary: Get the `Check your answers` page
 *     tags: [Portal - Amendments]
 *     description: Get the `Check your answers` page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       302:
 *         description: Resource temporary moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post check your answers page & submit the amendment to checker
 *     tags: [Portal - Amendments]
 *     description: Post check your answers page & submit the amendment to checker
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${CHECK_YOUR_ANSWERS}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getCheckYourAnswers)
  .post(postCheckYourAnswers);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${RETURN_TO_MAKER}:
 *   get:
 *     summary: Get the return amendment to maker page
 *     tags: [Portal - Amendments]
 *     description: Get the return amendment to maker page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       302:
 *         description: Resource temporary moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post return amendment to maker
 *     tags: [Portal - Amendments]
 *     description: Post return amendment to maker
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: The comment from the checker explaining why the amendment is being returned to the maker
 *           example:
 *             comment: 'Please update the facility value'
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${RETURN_TO_MAKER}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [CHECKER] })])
  .get(getReturnAmendmentToMaker)
  .post(postReturnAmendmentToMaker);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${RETURNED_TO_MAKER}:
 *   get:
 *     summary: Get returned to maker page
 *     tags: [Portal - Amendments]
 *     description: Get returned to maker page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${RETURNED_TO_MAKER}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [CHECKER] })])
  .get(getReturnedToMaker);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${SUBMITTED_FOR_CHECKING}:
 *   get:
 *     summary: Get the submitted for checking amendment page
 *     tags: [Portal - Amendments]
 *     description: Get the submitted for checking amendment page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${SUBMITTED_FOR_CHECKING}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getSubmittedForChecking);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${SUBMIT_AMENDMENT_TO_UKEF}:
 *   get:
 *     summary: Get the submit to ukef confirmation page
 *     tags: [Portal - Amendments]
 *     description: Get the submit to ukef confirmation page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post the Amendment to UKEF
 *     tags: [Portal - Amendments]
 *     description: Post the Amendment to UKEF
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confirmSubmitUkef:
 *                 type: boolean
 *                 description: The user's answer to whether they want to submit the amendment to UKEF (true/false)
 *           example:
 *             confirmSubmitUkef: true
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${SUBMIT_AMENDMENT_TO_UKEF}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [CHECKER] })])
  .get(getSubmitAmendmentToUkef)
  .post(postSubmitAmendmentToUkef);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${APPROVED_BY_UKEF}:
 *   get:
 *     summary: Get approval by ukef amendment page
 *     tags: [Portal - Amendments]
 *     description: Get approval by ukef amendment page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${APPROVED_BY_UKEF}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [CHECKER] })])
  .get(getApprovedByUkef);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${ABANDON}:
 *   get:
 *     summary: Get the abandon amendment page
 *     tags: [Portal - Amendments]
 *     description: Get the abandon amendment page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post the abandon amendment page
 *     tags: [Portal - Amendments]
 *     description: Post the abandon amendment page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${ABANDON}`)
  .all([
    validatePortalFacilityAmendmentsEnabled,
    validateToken,
    validateBank,
    validateMongoId('dealId'),
    validateMongoId('facilityId'),
    validateMongoId('amendmentId'),
    validateRole({ role: [MAKER] }),
  ])
  .get(getAbandonPortalFacilityAmendment)
  .post(postAbandonPortalFacilityAmendment);

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${AMENDMENT_DETAILS}:
 *   get:
 *     summary: Get the `Amendment details` page
 *     tags: [Portal - Amendments]
 *     description: Get the `Amendment details` page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post check your answers page & submit the amendment to checker
 *     tags: [Portal - Amendments]
 *     description: Post check your answers page & submit the amendment to checker
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId, amendmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID, facility ID and the amendment ID
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${AMENDMENT_DETAILS}`)
  .all([
    validatePortalFacilityAmendmentsEnabled,
    validateMongoId('dealId'),
    validateMongoId('facilityId'),
    validateMongoId('amendmentId'),
    validateToken,
    validateBank,
    validateDealStatusForAmendment,
    validateRole({ role: [MAKER, CHECKER] }),
  ])
  .get(getAmendmentDetails)
  .post(postCheckYourAnswers);

/**
 * @openapi
 * /application-details/:dealId/${ALL_TYPES_AMENDMENTS}:
 *   get:
 *     summary: Get application amendments page
 *     tags: [Portal - Amendments]
 *     description: Get application amendments page
 *     parameters:
 *       - in: path
 *         name: dealId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router
  .route(`/application-details/:dealId/${ALL_TYPES_AMENDMENTS}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateRole({ role: [MAKER, CHECKER] })])
  .get(getApplicationAmendments);

export default router;
