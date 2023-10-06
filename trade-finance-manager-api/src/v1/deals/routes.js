const express = require('express');
const dealSubmit = require('../controllers/deal.submit.controller');
const amendmentController = require('../controllers/amendment.controller');
const dealController = require('../controllers/deal.controller');
const validation = require('../validation/route-validators/route-validators');
const handleValidationResult = require('../validation/route-validators/validation-handler');

const dealsAuthRouter = express.Router();
const dealsOpenRouter = express.Router();
/**
 * @openapi
 * /deals/submit:
 *   put:
 *     summary: Submit a deal
 *     tags: [Deals]
 *     description: Creates snapshots (via Central API), calls external APIs, sends status update to internal APIs
 *     requestBody:
 *       description: Fields required to find a deal and send updates to Portal. The checker object is for Portal update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dealId:
 *                 type: string
 *               dealType:
 *                 type: string
 *               checker:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   firstname:
 *                     type: string
 *                   surname:
 *                     type: string
 *             example:
 *               dealId: 123abc
 *               dealType: BSS/EWCS
 *               checker:
 *                 _id: 123abc
 *                 username: BANK1_CHECKER1
 *                 firstname: Joe
 *                 surname: Bloggs
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               _id: 123abc
 *               dealSnapshot:
 *                 _id: 123abc
 *                 dealType: BSS/EWCS
 *                 status: Submitted
 *                 submissionCount: 1
 *                 facilities: ['123', '456']
 *               tfm:
 *                 product: BSS & EWCS
 *                 dateReceived: 16-09-2021
 *                 stage: Confirmed
 *                 exporterCreditRating: Acceptable (B+)
 *       404:
 *         description: Not found
 */
dealsOpenRouter.route('/deals/submit').put(dealSubmit.submitDealPUT);

dealsAuthRouter.route('/deals/submitDealAfterUkefIds').put(dealSubmit.submitDealAfterUkefIdsPUT);

dealsAuthRouter.route('/deals').get(dealController.getDeals);
dealsAuthRouter
  .route('/deals/:dealId')
  .get(validation.dealIdValidation, handleValidationResult, dealController.getDeal)
  .put(validation.dealIdValidation, handleValidationResult, dealController.updateDeal);

dealsAuthRouter
  .route('/deals/:dealId/amendments/:status?/:type?')
  .get(validation.dealIdValidation, handleValidationResult, amendmentController.getAmendmentsByDealId);

dealsAuthRouter
  .route('/deals/:dealId/underwriting/update-lead-underwriter')
  .put(validation.dealIdValidation, handleValidationResult, dealController.updateLeadUnderwriter);

module.exports = {
  dealsAuthRouter,
  dealsOpenRouter
};
