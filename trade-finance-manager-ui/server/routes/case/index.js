const express = require('express');
const caseController = require('../../controllers/case');
const partiesController = require('../../controllers/case/parties');
const underwritingController = require('../../controllers/case/underwriting');
const activityController = require('../../controllers/case/activity');

const router = express.Router();

router.get('/:_id/deal', caseController.getCaseDeal);

router.get('/:_id/tasks', caseController.getCaseTasks);
router.post('/:_id/tasks', caseController.filterCaseTasks);

router.get('/:_id/tasks/:groupId/:taskId', caseController.getCaseTask);
router.post('/:_id/tasks/:groupId/:taskId', caseController.putCaseTask);

router.get('/:_id/facility/:facilityId', caseController.getCaseFacility);

router.get('/:_id/parties', partiesController.getCaseParties);

router.get('/:_id/parties/exporter', partiesController.getExporterPartyDetails);
router.post('/:_id/parties/exporter', partiesController.postExporterPartyDetails);

router.get('/:_id/parties/buyer', partiesController.getBuyerPartyDetails);
router.post('/:_id/parties/buyer', partiesController.postBuyerPartyDetails);

router.get('/:_id/parties/agent', partiesController.getAgentPartyDetails);
router.post('/:_id/parties/agent', partiesController.postAgentPartyDetails);

router.get('/:_id/parties/indemnifier', partiesController.getIndemnifierPartyDetails);
router.post('/:_id/parties/indemnifier', partiesController.postIndemnifierPartyDetails);

router.get('/:_id/parties/bond-issuer', partiesController.getBondIssuerPartyDetails);
router.post('/:_id/parties/bond-issuer', caseController.postTfmFacility);

router.get('/:_id/parties/bond-beneficiary', partiesController.getBondBeneficiaryPartyDetails);
router.post('/:_id/parties/bond-beneficiary', caseController.postTfmFacility);

router.get('/:_id/activity', activityController.getActivity);
router.post('/:_id/activity', activityController.filterActivities);
router.get('/:_id/activity/post-comment', activityController.getCommentBox);
router.post('/:_id/activity/post-comment', activityController.postComment);

router.get('/:_id/underwriting/pricing-and-risk', underwritingController.getUnderWritingPricingAndRisk);
router.get('/:_id/underwriting/pricing-and-risk/edit', underwritingController.getUnderWritingPricingAndRiskEdit);
router.post('/:_id/underwriting/pricing-and-risk/edit', underwritingController.postUnderWritingPricingAndRisk);
router.get('/:_id/underwriting/pricing-and-risk/loss-given-default', underwritingController.getUnderWritingLossGivenDefault);
router.post('/:_id/underwriting/pricing-and-risk/loss-given-default', underwritingController.postUnderWritingLossGivenDefault);
router.get('/:_id/underwriting/pricing-and-risk/probability-of-default', underwritingController.getUnderWritingProbabilityOfDefault);
router.post('/:_id/underwriting/pricing-and-risk/probability-of-default', underwritingController.postUnderWritingProbabilityOfDefault);

router.get('/:_id/underwriting/pricing-and-risk/facility/:facilityId/risk-profile', underwritingController.getUnderWritingFacilityRiskProfileEdit);
router.post('/:_id/underwriting/pricing-and-risk/facility/:facilityId/risk-profile', underwritingController.postUnderWritingFacilityRiskProfileEdit);

router.get('/:_id/underwriting/lead-underwriter', underwritingController.getLeadUnderwriter);
router.get('/:_id/underwriting/lead-underwriter/assign', underwritingController.getAssignLeadUnderwriter);
router.post('/:_id/underwriting/lead-underwriter/assign', underwritingController.postAssignLeadUnderwriter);

router.get('/:_id/underwriting/bank-security', underwritingController.getUnderWritingBankSecurity);

router.get('/:_id/underwriting/managers-decision', underwritingController.getUnderwriterManagersDecision);

router.get('/:_id/underwriting/managers-decision/edit', underwritingController.getUnderwriterManagersDecisionEdit);
router.post('/:_id/underwriting/managers-decision/edit', underwritingController.postUnderwriterManagersDecision);

router.get('/:_id/documents', caseController.getCaseDocuments);

module.exports = router;
