/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { getBankReviewDateFromApplicationDetailsPage } from '../../controllers/bank-review-date/get-bank-review-date';
import { postBankReviewDateFromApplicationDetailsPage } from '../../controllers/bank-review-date/post-bank-review-date';
import { validateRole, validateToken, validateBank } from '../../middleware';
import { MAKER } from '../../constants/roles';

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/bank-review-date:
 *   get:
 *     summary: Get bank review date from application details page
 *     tags: [Portal - Gef]
 *     description: Get bank review date from application details page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
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
 *     summary: Post bank review date from application details page
 *     tags: [Portal - Gef]
 *     description: Post bank review date from application details page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
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
  .route('/application-details/:dealId/facilities/:facilityId/bank-review-date')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getBankReviewDateFromApplicationDetailsPage)
  .post(postBankReviewDateFromApplicationDetailsPage);

export default router;
