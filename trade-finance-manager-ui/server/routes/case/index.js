const express = require('express');
const { TEAM_IDS } = require('@ukef/dtfs2-common');
const caseController = require('../../controllers/case');
const partiesController = require('../../controllers/case/parties');
const underwritingController = require('../../controllers/case/underwriting');
const activityController = require('../../controllers/case/activity');
const amendmentsController = require('../../controllers/case/amendments');
const { validateUserTeam } = require('../../middleware');
const { cancellationRouter } = require('./cancellation');

const router = express.Router();

router.get('/:_id/deal', caseController.getCaseDeal);

router.get('/:_id/tasks', caseController.getCaseTasks);
router.post('/:_id/tasks', caseController.filterCaseTasks);

router.get('/:_id/tasks/:groupId/:taskId', caseController.getCaseTask);
router.post('/:_id/tasks/:groupId/:taskId', caseController.putCaseTask);

router.get('/:_id/facility/:facilityId', caseController.getCaseFacility);
router.post('/:_id/facility/:facilityId', caseController.postFacilityAmendment);

router.get('/:_id/facility/:facilityId/amendment/:amendmentId/request-date', amendmentsController.getAmendmentRequestDate);
router.post('/:_id/facility/:facilityId/amendment/:amendmentId/request-date', amendmentsController.postAmendmentRequestDate);

router.get('/:_id/facility/:facilityId/amendment/:amendmentId/request-approval', amendmentsController.getAmendmentRequestApproval);
router.post('/:_id/facility/:facilityId/amendment/:amendmentId/request-approval', amendmentsController.postAmendmentRequestApproval);

router.get('/:_id/facility/:facilityId/amendment/:amendmentId/amendment-options', amendmentsController.getAmendmentOptions);
router.post('/:_id/facility/:facilityId/amendment/:amendmentId/amendment-options', amendmentsController.postAmendmentOptions);

router.get('/:_id/facility/:facilityId/amendment/:amendmentId/amendment-effective-date', amendmentsController.getAmendmentEffectiveDate);
router.post('/:_id/facility/:facilityId/amendment/:amendmentId/amendment-effective-date', amendmentsController.postAmendmentEffectiveDate);

router.get('/:_id/facility/:facilityId/amendment/:amendmentId/lead-underwriter', amendmentsController.getAssignAmendmentLeadUnderwriter);
router.post('/:_id/facility/:facilityId/amendment/:amendmentId/lead-underwriter', amendmentsController.postAssignAmendmentLeadUnderwriter);

router.get('/:_id/facility/:facilityId/amendment/:amendmentId/facility-value', validateUserTeam([TEAM_IDS.PIM]), amendmentsController.getAmendFacilityValue);
router.post('/:_id/facility/:facilityId/amendment/:amendmentId/facility-value', validateUserTeam([TEAM_IDS.PIM]), amendmentsController.postAmendFacilityValue);

router.get(
  '/:_id/facility/:facilityId/amendment/:amendmentId/facility-value/managers-decision',
  amendmentsController.getAmendmentAddUnderwriterManagersFacilityValue,
);
router.post(
  '/:_id/facility/:facilityId/amendment/:amendmentId/facility-value/managers-decision',
  amendmentsController.postAmendmentAddUnderwriterManagersFacilityValue,
);

router.get('/:_id/facility/:facilityId/amendment/:amendmentId/cover-end-date', validateUserTeam([TEAM_IDS.PIM]), amendmentsController.getAmendCoverEndDate);
router.post('/:_id/facility/:facilityId/amendment/:amendmentId/cover-end-date', validateUserTeam([TEAM_IDS.PIM]), amendmentsController.postAmendCoverEndDate);

router.get(
  '/:_id/facility/:facilityId/amendment/:amendmentId/is-using-facility-end-date',
  validateUserTeam([TEAM_IDS.PIM]),
  amendmentsController.getAmendmentIsUsingFacilityEndDate,
);
router.post(
  '/:_id/facility/:facilityId/amendment/:amendmentId/is-using-facility-end-date',
  validateUserTeam([TEAM_IDS.PIM]),
  amendmentsController.postAmendmentIsUsingFacilityEndDate,
);

router.get(
  '/:_id/facility/:facilityId/amendment/:amendmentId/facility-end-date',
  validateUserTeam([TEAM_IDS.PIM]),
  amendmentsController.getAmendmentFacilityEndDate,
);
router.post(
  '/:_id/facility/:facilityId/amendment/:amendmentId/facility-end-date',
  validateUserTeam([TEAM_IDS.PIM]),
  amendmentsController.postAmendmentFacilityEndDate,
);

router.get(
  '/:_id/facility/:facilityId/amendment/:amendmentId/bank-review-date',
  validateUserTeam([TEAM_IDS.PIM]),
  amendmentsController.getAmendmentBankReviewDate,
);
router.post(
  '/:_id/facility/:facilityId/amendment/:amendmentId/bank-review-date',
  validateUserTeam([TEAM_IDS.PIM]),
  amendmentsController.postAmendmentBankReviewDate,
);

router.get(
  '/:_id/facility/:facilityId/amendment/:amendmentId/cover-end-date/managers-decision',
  amendmentsController.getAmendmentAddUnderwriterManagersDecisionCoverEndDate,
);
router.post(
  '/:_id/facility/:facilityId/amendment/:amendmentId/cover-end-date/managers-decision',
  amendmentsController.postAmendmentAddUnderwriterManagersDecisionCoverEndDate,
);

router.get('/:_id/facility/:facilityId/amendment/:amendmentId/check-answers', validateUserTeam([TEAM_IDS.PIM]), amendmentsController.getAmendmentAnswers);
router.post('/:_id/facility/:facilityId/amendment/:amendmentId/check-answers', validateUserTeam([TEAM_IDS.PIM]), amendmentsController.postAmendmentAnswers);

router.get('/:_id/facility/:facilityId/amendment/:amendmentId/managers-conditions', amendmentsController.getManagersConditionsAndComments);
router.post('/:_id/facility/:facilityId/amendment/:amendmentId/managers-conditions', amendmentsController.postManagersConditionsAndComments);

router.get('/:_id/facility/:facilityId/amendment/:amendmentId/managers-conditions/summary', amendmentsController.getManagersConditionsAndCommentsSummary);
router.post('/:_id/facility/:facilityId/amendment/:amendmentId/managers-conditions/summary', amendmentsController.postManagersConditionsAndCommentsSummary);

router.get('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision', amendmentsController.getAmendmentBankDecisionChoice);
router.post('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision', amendmentsController.postAmendmentBankDecisionChoice);

router.get('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/received-date', amendmentsController.getAmendmentBankDecisionReceivedDate);
router.post('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/received-date', amendmentsController.postAmendmentBankDecisionReceivedDate);

router.get('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/effective-date', amendmentsController.getAmendmentBankDecisionEffectiveDate);
router.post('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/effective-date', amendmentsController.postAmendmentBankDecisionEffectiveDate);

router.get('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/check-answers', amendmentsController.getAmendmentBankDecisionAnswers);
router.post('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/check-answers', amendmentsController.postAmendmentBankDecisionAnswers);
router.get('/:_id/facility/:facilityId/amendment/:amendmentId/task/:taskId/group/:groupId', amendmentsController.getAmendmentTask);
router.post('/:_id/facility/:facilityId/amendment/:amendmentId/task/:taskId/group/:groupId', amendmentsController.postAmendmentTask);

router.get('/:_id/parties', partiesController.getAllParties);

router.get('/:_id/parties/exporter', partiesController.getPartyDetails);
router.post('/:_id/parties/exporter', partiesController.confirmPartyUrn);
router.get('/:_id/parties/exporter/summary/:urn', partiesController.getPartyUrnDetails);
router.post('/:_id/parties/exporter/summary/:urn', partiesController.postPartyDetails);

router.get('/:_id/parties/buyer', partiesController.getPartyDetails);
router.post('/:_id/parties/buyer', partiesController.confirmPartyUrn);
router.get('/:_id/parties/buyer/summary/:urn', partiesController.getPartyUrnDetails);
router.post('/:_id/parties/buyer/summary/:urn', partiesController.postPartyDetails);

router.get('/:_id/parties/agent', partiesController.getPartyDetails);
router.post('/:_id/parties/agent', partiesController.confirmPartyUrn);
router.get('/:_id/parties/agent/summary/:urn', partiesController.getPartyUrnDetails);
router.post('/:_id/parties/agent/summary/:urn', partiesController.postPartyDetails);

router.get('/:_id/parties/indemnifier', partiesController.getPartyDetails);
router.post('/:_id/parties/indemnifier', partiesController.confirmPartyUrn);
router.get('/:_id/parties/indemnifier/summary/:urn', partiesController.getPartyUrnDetails);
router.post('/:_id/parties/indemnifier/summary/:urn', partiesController.postPartyDetails);

router.get('/:_id/parties/bond-issuer', partiesController.getPartyDetails);
router.post('/:_id/parties/bond-issuer', caseController.confirmTfmFacility);
router.get('/:_id/parties/bond-issuer/summary', partiesController.getBondUrnDetails);
router.post('/:_id/parties/bond-issuer/summary', caseController.postTfmFacility);

router.get('/:_id/parties/bond-beneficiary', partiesController.getPartyDetails);
router.post('/:_id/parties/bond-beneficiary', caseController.confirmTfmFacility);
router.get('/:_id/parties/bond-beneficiary/summary', partiesController.getBondUrnDetails);
router.post('/:_id/parties/bond-beneficiary/summary', caseController.postTfmFacility);

router.get('/:_id/activity', activityController.getActivity);
router.post('/:_id/activity', activityController.filterActivities);
router.get('/:_id/activity/post-comment', activityController.getCommentBox);
router.post('/:_id/activity/post-comment', activityController.postComment);

router.get('/:_id/underwriting', underwritingController.getUnderwriterPage);

router.get('/:_id/underwriting/pricing-and-risk/edit', underwritingController.getUnderWritingPricingAndRiskEdit);
router.post('/:_id/underwriting/pricing-and-risk/edit', underwritingController.postUnderWritingPricingAndRisk);
router.get('/:_id/underwriting/pricing-and-risk/loss-given-default', underwritingController.getUnderWritingLossGivenDefault);
router.post('/:_id/underwriting/pricing-and-risk/loss-given-default', underwritingController.postUnderWritingLossGivenDefault);
router.get('/:_id/underwriting/pricing-and-risk/probability-of-default', underwritingController.getUnderWritingProbabilityOfDefault);
router.post('/:_id/underwriting/pricing-and-risk/probability-of-default', underwritingController.postUnderWritingProbabilityOfDefault);

router.get('/:_id/underwriting/pricing-and-risk/facility/:facilityId/risk-profile', underwritingController.getUnderWritingFacilityRiskProfileEdit);
router.post('/:_id/underwriting/pricing-and-risk/facility/:facilityId/risk-profile', underwritingController.postUnderWritingFacilityRiskProfileEdit);

router.get('/:_id/underwriting/lead-underwriter/assign', underwritingController.getAssignLeadUnderwriter);
router.post('/:_id/underwriting/lead-underwriter/assign', underwritingController.postAssignLeadUnderwriter);

router.get('/:_id/underwriting/managers-decision/edit', underwritingController.getUnderwriterManagersDecisionEdit);
router.post('/:_id/underwriting/managers-decision/edit', underwritingController.postUnderwriterManagersDecision);

router.get('/:_id/documents', caseController.getCaseDocuments);

router.use('/:_id/cancellation', cancellationRouter);

module.exports = router;
