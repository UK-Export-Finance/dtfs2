/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { validateRole, validateToken, validateBank } from '../../../middleware';
import { MAKER } from '../../../constants/roles';
import { getWhatNeedsToChange } from '../../../controllers/amendments/what-needs-to-change/what-needs-to-change';

const router = express.Router();

router
  .route('/application-details/:dealId/facilities/:facilityId/amendments/:amendmentId/what-needs-to-change')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getWhatNeedsToChange);

export default router;
