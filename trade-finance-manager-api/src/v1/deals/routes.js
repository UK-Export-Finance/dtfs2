const express = require('express');
const dealSubmit = require('../controllers/deal.submit.controller');
const amendmentController = require('../controllers/amendment.controller');
const dealController = require('../controllers/deal.controller');
const dealUnderwriterManagersDecisionController = require('../controllers/deal-underwriter-managers-decision.controller');
const validation = require('../validation/route-validators/route-validators');
const handleExpressValidatorResult = require('../validation/route-validators/express-validator-result-handler');

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
 *               auditDetails:
 *                 type: object
 *                 properties:
 *                   userType:
 *                     type: string
 *                     enum: [portal]
 *                   id:
 *                     type: string
 *             example:
 *               dealId: 123abc
 *               dealType: BSS/EWCS
 *               auditDetails:
 *                 id: 1234567890abcdef12345678
 *                 userType: portal
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
// `PUT /deals/submit` is called by portal API (without a TFM user to authenticate as)
// so this endpoint cannot be on the auth router
dealsOpenRouter.route('/deals/submit').put(dealSubmit.submitDealPUT);

const dealsAuthRouter = express.Router();

dealsAuthRouter.route('/deals/submitDealAfterUkefIds').put(dealSubmit.submitDealAfterUkefIdsPUT);

dealsAuthRouter.route('/deals').get(dealController.getDeals);
dealsAuthRouter
  .route('/deals/:dealId')
  .get(validation.dealIdValidation, handleExpressValidatorResult, dealController.getDeal)
  .put(validation.dealIdValidation, handleExpressValidatorResult, dealController.updateDeal);

dealsAuthRouter
  .route('/deals/:dealId/amendments/:status?/:type?')
  .get(validation.dealIdValidation, handleExpressValidatorResult, amendmentController.getAmendmentsByDealId);

dealsAuthRouter
  .route('/deals/:dealId/underwriting/lead-underwriter')
  .put(validation.dealIdValidation, handleExpressValidatorResult, dealController.updateLeadUnderwriter);

/**
 * @openapi
 * /deals/{dealId}/underwriting/managers-decision:
 *   put:
 *     summary: Update the underwriter manager's decision for the deal.
 *     description: |
 *       Update the underwriter manager's decision for the deal with the given dealId.
 *       This also updates the deal status in Portal and adds a comment to the deal in Portal.
 *       For MIA deals, the bank and PIM are notified of the decision.
 *     tags: [Deals]
 *     parameters:
 *       - in: path
 *         name: dealId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the deal.
 *     requestBody:
 *       description: The new underwriter manager's decision for the deal.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                   decision:
 *                     type: string
 *                     enum:
 *                       - Approved (without conditions)
 *                       - Approved (with conditions)
 *                       - Declined
 *                     required: true
 *                   comments:
 *                     type: string
 *                     required: false
 *                   internalComments:
 *                     type: string
 *                     required: false
 *                   userFullName:
 *                     type: string
 *                     required: true
 *     responses:
 *       200:
 *         description: The underwriter manager's decision for the deal has been updated successfully.
 *       400:
 *         description: Bad Request.
 */
dealsAuthRouter
  .route('/deals/:dealId/underwriting/managers-decision')
  .put(validation.dealIdValidation, handleExpressValidatorResult, dealUnderwriterManagersDecisionController.updateUnderwriterManagersDecision);

module.exports = {
  dealsOpenRouter,
  dealsAuthRouter,
};
