/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { getFacilityEndDateFromApplicationDetailsPage } from '../../controllers/facility-end-date/get-facility-end-date';
import { postFacilityEndDateFromApplicationDetailsPage } from '../../controllers/facility-end-date/post-facility-end-date';
import { validateRole, validateToken, validateBank } from '../../middleware';
import { MAKER } from '../../constants/roles';

const router = express.Router();

/**
 * @openapi
 * /application-details/:dealId/facilities/:facilityId/facility-end-date:
 *   get:
 *     summary: Get facility end date from application details page
 *     tags: [Portal - Gef]
 *     description: facility end date from application details page
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
 *         description: Resource temporarily moved
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
 *     summary: post facility end date from application details page
 *     tags: [Portal - Gef]
 *     description: post facility end date from application details page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           example: 'DRAFT'
 *         description: the deal status
 *       - in: query
 *         name: saveAndReturn
 *         schema:
 *           type: string
 *           example: 'true'
 *         description: indicates if the user clicked 'Save and return to application'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               facility-end-date-year:
 *                 type: string
 *                 description: The year of the facility end date
 *               facility-end-date-month:
 *                 type: string
 *                 description: The month of the facility end date
 *               facility-end-date-day:
 *                 type: string
 *                 description: The day of the facility end date
 *               previousPage:
 *                 type: string
 *                 description: The previous page URL
 *           example:
 *             facility-end-date-year: '2024'
 *             facility-end-date-month: '12'
 *             facility-end-date-day: '31'
 *             previousPage: '/gef/application-details/12345'
 *     responses:
 *       200:
 *         description: OK
 *       301:
 *         description: Resource moved permanently
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
  .route('/application-details/:dealId/facilities/:facilityId/facility-end-date')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getFacilityEndDateFromApplicationDetailsPage)
  .post(postFacilityEndDateFromApplicationDetailsPage);

export default router;
