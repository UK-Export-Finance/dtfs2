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

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/create-draft/`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .post(postCreateDraftFacilityAmendment);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${WHAT_DO_YOU_NEED_TO_CHANGE}/`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getWhatNeedsToChange)
  .post(postWhatNeedsToChange);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${FACILITY_VALUE}/`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getFacilityValue)
  .post(postFacilityValue);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${COVER_END_DATE}/`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getCoverEndDate)
  .post(postCoverEndDate);

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

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${DO_YOU_HAVE_A_FACILITY_END_DATE}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getDoYouHaveAFacilityEndDate)
  .post(postDoYouHaveAFacilityEndDate);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${FACILITY_END_DATE}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getFacilityEndDate)
  .post(postFacilityEndDate);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${BANK_REVIEW_DATE}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getBankReviewDate)
  .post(postBankReviewDate);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${ELIGIBILITY}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getEligibility)
  .post(postEligibility);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${MANUAL_APPROVAL_NEEDED}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getManualApprovalNeeded);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${EFFECTIVE_DATE}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getEffectiveDate)
  .post(postEffectiveDate);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${CHECK_YOUR_ANSWERS}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getCheckYourAnswers)
  .post(postCheckYourAnswers);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${RETURN_TO_MAKER}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [CHECKER] })])
  .get(getReturnAmendmentToMaker)
  .post(postReturnAmendmentToMaker);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${RETURNED_TO_MAKER}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [CHECKER] })])
  .get(getReturnedToMaker);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${SUBMITTED_FOR_CHECKING}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [MAKER] })])
  .get(getSubmittedForChecking);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${SUBMIT_AMENDMENT_TO_UKEF}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [CHECKER] })])
  .get(getSubmitAmendmentToUkef)
  .post(postSubmitAmendmentToUkef);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${APPROVED_BY_UKEF}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateDealStatusForAmendment, validateRole({ role: [CHECKER] })])
  .get(getApprovedByUkef);

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

router
  .route(`/application-details/:dealId/${ALL_TYPES_AMENDMENTS}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateRole({ role: [MAKER, CHECKER] })])
  .get(getApplicationAmendments);

export default router;
