/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { getBankReviewDate, postBankReviewDate } from '../../controllers/bank-review-date';
import { validateRole, validateToken, validateBank } from '../../middleware';
import { MAKER } from '../../constants/roles';

const router = express.Router();

router
  .route('/application-details/:dealId/facilities/:facilityId/bank-review-date')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getBankReviewDate)
  .post(postBankReviewDate);

export default router;
