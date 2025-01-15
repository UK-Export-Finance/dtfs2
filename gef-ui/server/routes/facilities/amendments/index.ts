/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { validatePortalFacilityAmendmentsEnabled } from '../../../middleware/feature-flags/portal-facility-amendments';
import { validateRole, validateToken, validateBank } from '../../../middleware';
import { MAKER } from '../../../constants/roles';
import { postCreateDraftFacilityAmendment } from '../../../controllers/amendments/create-draft/post-create-draft';
import { getWhatNeedsToChange } from '../../../controllers/amendments/what-needs-to-change/get-what-needs-to-change';
import { postWhatNeedsToChange } from '../../../controllers/amendments/what-needs-to-change/post-what-needs-to-change';
import { getFacilityValue } from '../../../controllers/amendments/facility-value/get-facility-value';
import { postFacilityValue } from '../../../controllers/amendments/facility-value/post-facility-value';
import { getCoverEndDate } from '../../../controllers/amendments/cover-end-date/get-cover-end-date';
import { postCoverEndDate } from '../../../controllers/amendments/cover-end-date/post-cover-end-date';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { getCancelPortalFacilityAmendment } from '../../../controllers/amendments/cancel-amendment/cancel-portal-facility-amendment';
import { getDoYouHaveAFacilityEndDate } from '../../../controllers/amendments/do-you-have-a-facility-end-date/get-do-you-have-a-facility-end-date';
import { postDoYouHaveAFacilityEndDate } from '../../../controllers/amendments/do-you-have-a-facility-end-date/post-do-you-have-a-facility-end-date';
import { getFacilityEndDate } from '../../../controllers/amendments/facility-end-date/get-facility-end-date';
import { getBankReviewDate } from '../../../controllers/amendments/bank-review-date/get-bank-review-date.ts';

const { WHAT_DO_YOU_NEED_TO_CHANGE, COVER_END_DATE, FACILITY_VALUE, DO_YOU_HAVE_A_FACILITY_END_DATE, FACILITY_END_DATE, BANK_REVIEW_DATE } =
  PORTAL_AMENDMENT_PAGES;

const router = express.Router();

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/create-draft/`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateRole({ role: [MAKER] })])
  .post(postCreateDraftFacilityAmendment);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${WHAT_DO_YOU_NEED_TO_CHANGE}/`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getWhatNeedsToChange)
  .post(postWhatNeedsToChange);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${FACILITY_VALUE}/`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getFacilityValue)
  .post(postFacilityValue);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${COVER_END_DATE}/`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getCoverEndDate)
  .post(postCoverEndDate);

router
  .route('/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/cancel')
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getCancelPortalFacilityAmendment);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${DO_YOU_HAVE_A_FACILITY_END_DATE}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getDoYouHaveAFacilityEndDate)
  .post(postDoYouHaveAFacilityEndDate);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${FACILITY_END_DATE}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getFacilityEndDate);

router
  .route(`/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/${BANK_REVIEW_DATE}`)
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getBankReviewDate);

export default router;
