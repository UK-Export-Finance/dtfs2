/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { TEAM_IDS } from '@ukef/dtfs2-common';
import { getReasonForCancelling, postReasonForCancelling } from '../../controllers/case/cancellation/reason-for-cancelling.controller';
import { getBankRequestDate, postBankRequestDate } from '../../controllers/case/cancellation/bank-request-date.controller';
import { validateUserTeam } from '../../middleware';
import { validateDealCancellationEnabled } from '../../middleware/feature-flags/deal-cancellation';
import { getEffectiveFromDate, postEffectiveFromDate } from '../../controllers/case/cancellation/effective-from-date.controller';
import { getCancelCancellation, postCancelCancellation } from '../../controllers/case/cancellation/cancel-cancellation.controller';
import { getDealCancellationDetails, postDealCancellationDetails } from '../../controllers/case/cancellation/check-details.controller';

export const cancellationRouter = Router();

cancellationRouter.use(validateDealCancellationEnabled, validateUserTeam([TEAM_IDS.PIM]));

/**
 * @openapi
 * /:_id/cancellation/reason:
 *   get:
 *     summary: Get the reason for cancelling page
 *     tags: [TFM]
 *     description: Get the reason for cancelling page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post to update the reason for cancelling
 *     tags: [TFM]
 *     description: Post to update the reason for cancelling
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
cancellationRouter.route('/:_id/cancellation/reason').get(getReasonForCancelling).post(postReasonForCancelling);

/**
 * @openapi
 * /:_id/cancellation/bank-request-date:
 *   get:
 *     summary: Get the bank request date page
 *     tags: [TFM]
 *     description: Get the bank request date page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post to update the bank request date
 *     tags: [TFM]
 *     description: Post to update the bank request date
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
cancellationRouter.route('/:_id/cancellation/bank-request-date').get(getBankRequestDate).post(postBankRequestDate);

/**
 * @openapi
 * /:_id/cancellation/effective-from-date:
 *   get:
 *     summary: Get the effective from date page
 *     tags: [TFM]
 *     description: Get the effective from date page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post to update the effective from date
 *     tags: [TFM]
 *     description: Post to update the effective from date
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
cancellationRouter.route('/:_id/cancellation/effective-from-date').get(getEffectiveFromDate).post(postEffectiveFromDate);

/**
 * @openapi
 * /:_id/cancellation/cancel:
 *   get:
 *     summary: Get the cancel cancellation page
 *     tags: [TFM]
 *     description: Get the cancel cancellation page
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post to cancel the cancellation request
 *     tags: [TFM]
 *     description: Post to cancel the cancellation request
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
cancellationRouter.route('/:_id/cancellation/cancel').get(getCancelCancellation).post(postCancelCancellation);

/**
 * @openapi
 * /:_id/cancellation/check-details:
 *   get:
 *     summary: Get deal cancellation details
 *     tags: [TFM]
 *     description: Get deal cancellation details
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: Ok
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post the deal cancellation
 *     tags: [TFM]
 *     description: Post the deal cancellation
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       301:
 *         description: Resource permanently moved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal server error
 */
cancellationRouter.route('/:_id/cancellation/check-details').get(getDealCancellationDetails).post(postDealCancellationDetails);
