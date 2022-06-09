import {
  get,
  post,
} from '../../test-mocks/router-mock';
import caseController from '../../controllers/case';
import partiesController from '../../controllers/case/parties';
import underwritingController from '../../controllers/case/underwriting';
import activityController from '../../controllers/case/activity';
import amendmentsController from '../../controllers/case/amendments';

describe('routes - case', () => {
  beforeEach(() => {
    require('./index'); // eslint-disable-line global-require
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should setup routes with controllers', () => {
    // GET routes
    expect(get).toHaveBeenCalledTimes(37);

    expect(get).toHaveBeenCalledWith('/:_id/deal', caseController.getCaseDeal);

    expect(get).toHaveBeenCalledWith('/:_id/tasks', caseController.getCaseTasks);

    expect(get).toHaveBeenCalledWith('/:_id/tasks/:groupId/:taskId', caseController.getCaseTask);

    expect(get).toHaveBeenCalledWith('/:_id/facility/:facilityId', caseController.getCaseFacility);

    expect(get).toHaveBeenCalledWith('/:_id/parties', partiesController.getCaseParties);

    expect(get).toHaveBeenCalledWith('/:_id/parties/exporter', partiesController.getExporterPartyDetails);

    expect(get).toHaveBeenCalledWith('/:_id/parties/buyer', partiesController.getBuyerPartyDetails);

    expect(get).toHaveBeenCalledWith('/:_id/parties/agent', partiesController.getAgentPartyDetails);

    expect(get).toHaveBeenCalledWith('/:_id/parties/indemnifier', partiesController.getIndemnifierPartyDetails);

    expect(get).toHaveBeenCalledWith('/:_id/parties/bond-issuer', partiesController.getBondIssuerPartyDetails);

    expect(get).toHaveBeenCalledWith('/:_id/parties/bond-beneficiary', partiesController.getBondBeneficiaryPartyDetails);

    expect(get).toHaveBeenCalledWith('/:_id/documents', caseController.getCaseDocuments);

    expect(get).toHaveBeenCalledWith('/:_id/underwriting', underwritingController.getUnderwriterPage);

    expect(get).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/edit', underwritingController.getUnderWritingPricingAndRiskEdit);

    expect(get).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/loss-given-default', underwritingController.getUnderWritingLossGivenDefault);

    expect(get).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/probability-of-default', underwritingController.getUnderWritingProbabilityOfDefault);

    expect(get).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/facility/:facilityId/risk-profile', underwritingController.getUnderWritingFacilityRiskProfileEdit);

    expect(get).toHaveBeenCalledWith('/:_id/underwriting/lead-underwriter/assign', underwritingController.getAssignLeadUnderwriter);

    expect(get).toHaveBeenCalledWith('/:_id/underwriting/managers-decision/edit', underwritingController.getUnderwriterManagersDecisionEdit);

    expect(get).toHaveBeenCalledWith('/:_id/activity', activityController.getActivity);

    expect(get).toHaveBeenCalledWith('/:_id/activity/post-comment', activityController.getCommentBox);

    expect(get).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/request-date', amendmentsController.getAmendmentRequestDate);
    expect(get).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/request-approval', amendmentsController.getAmendmentRequestApproval);
    expect(get).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/amendment-options', amendmentsController.getAmendmentOptions);
    expect(get).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/amendment-effective-date', amendmentsController.getAmendmentEffectiveDate);
    expect(get).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/lead-underwriter', amendmentsController.getAssignAmendmentLeadUnderwriter);
    expect(get).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/cover-end-date/managers-decision', amendmentsController.getAmendmentAddUnderwriterManagersDecisionCoverEndDate);
    expect(get).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/facility-value/managers-decision', amendmentsController.getAmendmentAddUnderwriterManagersFacilityValue);
    expect(get).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision', amendmentsController.getAmendmentBankDecisionChoice);
    expect(get).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/received-date', amendmentsController.getAmendmentBankDecisionReceivedDate);
    expect(get).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/effective-date', amendmentsController.getAmendmentBankDecisionEffectiveDate);
    expect(get).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/check-answers', amendmentsController.getAmendmentBankDecisionAnswers);

    // POST routes
    expect(post).toHaveBeenCalledTimes(33);

    expect(post).toHaveBeenCalledWith('/:_id/tasks', caseController.filterCaseTasks);

    expect(post).toHaveBeenCalledWith('/:_id/tasks/:groupId/:taskId', caseController.putCaseTask);

    expect(post).toHaveBeenCalledWith('/:_id/parties/exporter', partiesController.postExporterPartyDetails);

    expect(post).toHaveBeenCalledWith('/:_id/parties/buyer', partiesController.postBuyerPartyDetails);

    expect(post).toHaveBeenCalledWith('/:_id/parties/agent', partiesController.postAgentPartyDetails);

    expect(post).toHaveBeenCalledWith('/:_id/parties/indemnifier', partiesController.postIndemnifierPartyDetails);

    expect(post).toHaveBeenCalledWith('/:_id/parties/bond-issuer', caseController.postTfmFacility);

    expect(post).toHaveBeenCalledWith('/:_id/parties/bond-beneficiary', caseController.postTfmFacility);

    expect(post).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/edit', underwritingController.postUnderWritingPricingAndRisk);

    expect(post).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/loss-given-default', underwritingController.postUnderWritingLossGivenDefault);

    expect(post).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/probability-of-default', underwritingController.postUnderWritingProbabilityOfDefault);

    expect(post).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/facility/:facilityId/risk-profile', underwritingController.postUnderWritingFacilityRiskProfileEdit);

    expect(post).toHaveBeenCalledWith('/:_id/underwriting/lead-underwriter/assign', underwritingController.postAssignLeadUnderwriter);

    expect(post).toHaveBeenCalledWith('/:_id/underwriting/managers-decision/edit', underwritingController.postUnderwriterManagersDecision);

    expect(post).toHaveBeenCalledWith('/:_id/activity', activityController.filterActivities);

    expect(post).toHaveBeenCalledWith('/:_id/activity/post-comment', activityController.postComment);

    expect(post).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/request-date', amendmentsController.postAmendmentRequestDate);
    expect(post).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/request-approval', amendmentsController.postAmendmentRequestApproval);
    expect(post).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/amendment-options', amendmentsController.postAmendmentOptions);
    expect(post).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/amendment-effective-date', amendmentsController.postAmendmentEffectiveDate);
    expect(post).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/lead-underwriter', amendmentsController.postAssignAmendmentLeadUnderwriter);
    expect(post).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/cover-end-date/managers-decision', amendmentsController.postAmendmentAddUnderwriterManagersDecisionCoverEndDate);
    expect(post).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/facility-value/managers-decision', amendmentsController.postAmendmentAddUnderwriterManagersFacilityValue);
    expect(post).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision', amendmentsController.postAmendmentBankDecisionChoice);
    expect(post).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/received-date', amendmentsController.postAmendmentBankDecisionReceivedDate);
    expect(post).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/effective-date', amendmentsController.postAmendmentBankDecisionEffectiveDate);
    expect(post).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/check-answers', amendmentsController.postAmendmentBankDecisionAnswers);
  });
});
