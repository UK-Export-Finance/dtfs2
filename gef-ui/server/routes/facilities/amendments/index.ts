/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { validatePortalFacilityAmendmentsEnabled } from '../../../middleware/feature-flags/portal-facility-amendments';
import { validateRole, validateToken, validateBank } from '../../../middleware';
import { MAKER } from '../../../constants/roles';
import { getWhatNeedsToChange } from '../../../controllers/amendments/what-needs-to-change/what-needs-to-change';
import { getFacilityValue } from '../../../controllers/amendments/facility-value/get-facility-value';

const router = express.Router();

// TODO: DTFS2-7683 - Include generated amendment ID in URLs as well

router
  .route('/application-details/:dealId/facilities/:facilityId/amendments/what-needs-to-change')
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getWhatNeedsToChange);

router
  .route('/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/facility-value')
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getFacilityValue);

export default router;
