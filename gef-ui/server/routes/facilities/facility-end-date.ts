/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { getFacilityEndDate, postFacilityEndDate } from '../../controllers/facility-end-date';
import { validateRole, validateToken, validateBank } from '../../middleware';
import { MAKER } from '../../constants/roles';

const router = express.Router();

router
  .route('/application-details/:dealId/facilities/:facilityId/facility-end-date')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getFacilityEndDate)
  .post(postFacilityEndDate);

export default router;
