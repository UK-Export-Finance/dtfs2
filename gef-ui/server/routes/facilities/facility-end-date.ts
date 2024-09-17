/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { getFacilityEndDateFromApplicationDetailsPage } from '../../controllers/facility-end-date/get-facility-end-date';
import { postFacilityEndDateFromApplicationDetailsPage } from '../../controllers/facility-end-date/post-facility-end-date';
import { validateRole, validateToken, validateBank } from '../../middleware';
import { MAKER } from '../../constants/roles';

const router = express.Router();

router
  .route('/application-details/:dealId/facilities/:facilityId/facility-end-date')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getFacilityEndDateFromApplicationDetailsPage)
  .post(postFacilityEndDateFromApplicationDetailsPage);

export default router;
