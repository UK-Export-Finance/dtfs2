// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, jest } from '@jest/globals';
import { TEAM_IDS } from '@ukef/dtfs2-common';
import { route } from '../../test-mocks/router-mock';
import caseController from '../../controllers/case';
import partiesController from '../../controllers/case/parties';
import underwritingController from '../../controllers/case/underwriting';
import activityController from '../../controllers/case/activity';
import amendmentsController from '../../controllers/case/amendments';
import { validateUserTeam } from '../../middleware';

jest.mock('./cancellation', () => ({
  cancellationRouter: jest.fn(),
}));

jest.mock('../../middleware', () => ({
  validateUserTeam: jest.fn(),
}));

describe('routes - case', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should setup routes with controllers', () => {
    require('./index'); // eslint-disable-line global-require

    expect(route).toHaveBeenCalledTimes(47);

    expect(route).toHaveBeenCalledWith('/:_id/deal');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(caseController.getCaseDeal);

    expect(route).toHaveBeenCalledWith('/:_id/tasks');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(caseController.getCaseTasks);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(caseController.filterCaseTasks);

    expect(route).toHaveBeenCalledWith('/:_id/tasks/:groupId/:taskId');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(caseController.getCaseTask);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(caseController.putCaseTask);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(caseController.getCaseFacility);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(caseController.postFacilityAmendment);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/request-date');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getAmendmentRequestDate);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postAmendmentRequestDate);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/request-approval');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getAmendmentRequestApproval);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postAmendmentRequestApproval);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/amendment-options');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getAmendmentOptions);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postAmendmentOptions);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/amendment-effective-date');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getAmendmentEffectiveDate);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postAmendmentEffectiveDate);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/lead-underwriter');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getAssignAmendmentLeadUnderwriter);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postAssignAmendmentLeadUnderwriter);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/facility-value');
    expect(route.mock.results[0].value.all).toHaveBeenCalledWith(validateUserTeam([TEAM_IDS.PIM]));
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getAmendFacilityValue);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postAmendFacilityValue);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/facility-value/managers-decision');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getAmendmentAddUnderwriterManagersFacilityValue);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postAmendmentAddUnderwriterManagersFacilityValue);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/cover-end-date');
    expect(route.mock.results[0].value.all).toHaveBeenCalledWith(validateUserTeam([TEAM_IDS.PIM]));
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getAmendCoverEndDate);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postAmendCoverEndDate);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/is-using-facility-end-date');
    expect(route.mock.results[0].value.all).toHaveBeenCalledWith(validateUserTeam([TEAM_IDS.PIM]));
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getAmendmentIsUsingFacilityEndDate);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postAmendmentIsUsingFacilityEndDate);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/facility-end-date');
    expect(route.mock.results[0].value.all).toHaveBeenCalledWith(validateUserTeam([TEAM_IDS.PIM]));
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getAmendmentFacilityEndDate);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postAmendmentFacilityEndDate);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/bank-review-date');
    expect(route.mock.results[0].value.all).toHaveBeenCalledWith(validateUserTeam([TEAM_IDS.PIM]));
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getAmendmentBankReviewDate);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postAmendmentBankReviewDate);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/cover-end-date/managers-decision');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getAmendmentAddUnderwriterManagersDecisionCoverEndDate);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postAmendmentAddUnderwriterManagersDecisionCoverEndDate);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/check-answers');
    expect(route.mock.results[0].value.all).toHaveBeenCalledWith(validateUserTeam([TEAM_IDS.PIM]));
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getAmendmentAnswers);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postAmendmentAnswers);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/managers-conditions');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getManagersConditionsAndComments);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postManagersConditionsAndComments);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/managers-conditions/summary');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getManagersConditionsAndCommentsSummary);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postManagersConditionsAndCommentsSummary);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getAmendmentBankDecisionChoice);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postAmendmentBankDecisionChoice);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/received-date');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getAmendmentBankDecisionReceivedDate);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postAmendmentBankDecisionReceivedDate);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/effective-date');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getAmendmentBankDecisionEffectiveDate);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postAmendmentBankDecisionEffectiveDate);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/banks-decision/check-answers');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getAmendmentBankDecisionAnswers);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postAmendmentBankDecisionAnswers);

    expect(route).toHaveBeenCalledWith('/:_id/facility/:facilityId/amendment/:amendmentId/task/:taskId/group/:groupId');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(amendmentsController.getAmendmentTask);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(amendmentsController.postAmendmentTask);

    expect(route).toHaveBeenCalledWith('/:_id/parties');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(partiesController.getAllParties);

    expect(route).toHaveBeenCalledWith('/:_id/parties/exporter');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(partiesController.getPartyDetails);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(partiesController.confirmPartyUrn);

    expect(route).toHaveBeenCalledWith('/:_id/parties/exporter/summary/:urn');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(partiesController.getPartyUrnDetails);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(partiesController.postPartyDetails);

    expect(route).toHaveBeenCalledWith('/:_id/parties/buyer');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(partiesController.getPartyDetails);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(partiesController.confirmPartyUrn);

    expect(route).toHaveBeenCalledWith('/:_id/parties/buyer/summary/:urn');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(partiesController.getPartyUrnDetails);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(partiesController.postPartyDetails);

    expect(route).toHaveBeenCalledWith('/:_id/parties/agent');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(partiesController.getPartyDetails);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(partiesController.confirmPartyUrn);

    expect(route).toHaveBeenCalledWith('/:_id/parties/agent/summary/:urn');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(partiesController.getPartyUrnDetails);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(partiesController.postPartyDetails);

    expect(route).toHaveBeenCalledWith('/:_id/parties/indemnifier');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(partiesController.getPartyDetails);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(partiesController.confirmPartyUrn);

    expect(route).toHaveBeenCalledWith('/:_id/parties/indemnifier/summary/:urn');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(partiesController.getPartyUrnDetails);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(partiesController.postPartyDetails);

    expect(route).toHaveBeenCalledWith('/:_id/parties/bond-issuer');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(partiesController.getPartyDetails);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(caseController.confirmTfmFacility);

    expect(route).toHaveBeenCalledWith('/:_id/parties/bond-issuer/summary');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(partiesController.getBondUrnDetails);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(caseController.postTfmFacility);

    expect(route).toHaveBeenCalledWith('/:_id/parties/bond-beneficiary');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(partiesController.getPartyDetails);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(caseController.confirmTfmFacility);

    expect(route).toHaveBeenCalledWith('/:_id/parties/bond-beneficiary/summary');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(partiesController.getBondUrnDetails);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(caseController.postTfmFacility);

    expect(route).toHaveBeenCalledWith('/:_id/activity');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(activityController.getActivity);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(activityController.filterActivities);

    expect(route).toHaveBeenCalledWith('/:_id/activity/post-comment');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(activityController.getCommentBox);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(activityController.postComment);

    expect(route).toHaveBeenCalledWith('/:_id/underwriting');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(underwritingController.getUnderwriterPage);

    expect(route).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/edit');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(underwritingController.getUnderWritingPricingAndRiskEdit);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(underwritingController.postUnderWritingPricingAndRisk);

    expect(route).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/loss-given-default');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(underwritingController.getUnderWritingLossGivenDefault);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(underwritingController.postUnderWritingLossGivenDefault);

    expect(route).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/probability-of-default');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(underwritingController.getUnderWritingProbabilityOfDefault);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(underwritingController.postUnderWritingProbabilityOfDefault);

    expect(route).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/facility/:facilityId/risk-profile');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(underwritingController.getUnderWritingFacilityRiskProfileEdit);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(underwritingController.postUnderWritingFacilityRiskProfileEdit);

    expect(route).toHaveBeenCalledWith('/:_id/underwriting/lead-underwriter/assign');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(underwritingController.getAssignLeadUnderwriter);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(underwritingController.postAssignLeadUnderwriter);

    expect(route).toHaveBeenCalledWith('/:_id/underwriting/managers-decision/edit');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(underwritingController.getUnderwriterManagersDecisionEdit);
    expect(route.mock.results[0].value.post).toHaveBeenCalledWith(underwritingController.postUnderwriterManagersDecision);

    expect(route).toHaveBeenCalledWith('/:_id/documents');
    expect(route.mock.results[0].value.get).toHaveBeenCalledWith(caseController.getCaseDocuments);
  });
});
