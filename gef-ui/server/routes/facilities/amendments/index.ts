/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { validateRole, validateToken, validateBank } from '../../../middleware';
import { MAKER } from '../../../constants/roles';
import { getFacilityValue } from '../../../controllers/amendments/facility-value/get-facility-value';
import { validatePortalFacilityAmendmentsEnabled } from '../../../middleware/feature-flags/portal-facility-amendments';

const router = express.Router();

router
  .route('/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/facility-value')
  .all([validatePortalFacilityAmendmentsEnabled, validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getFacilityValue);

export default router;
