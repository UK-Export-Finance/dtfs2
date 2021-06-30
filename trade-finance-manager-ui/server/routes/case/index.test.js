import {
  get,
  post,
} from '../../test-mocks/router-mock';
import caseController from '../../controllers/case';
import underwritingController from '../../controllers/case/underwriting';

describe('routes - case', () => {
  beforeEach(() => {
    require('./index'); // eslint-disable-line global-require
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should setup routes with controllers', () => {
    // GET routes
    expect(get).toHaveBeenCalledTimes(21);

    expect(get).toHaveBeenCalledWith('/:_id/deal', caseController.getCaseDeal);

    expect(get).toHaveBeenCalledWith('/:_id/tasks', caseController.getCaseTasks);

    expect(get).toHaveBeenCalledWith('/:_id/tasks/:groupId/:taskId', caseController.getCaseTask);

    expect(get).toHaveBeenCalledWith('/:_id/facility/:facilityId', caseController.getCaseFacility);

    expect(get).toHaveBeenCalledWith('/:_id/parties', caseController.getCaseParties);

    expect(get).toHaveBeenCalledWith('/:_id/parties/exporter', caseController.getExporterPartyDetails);

    expect(get).toHaveBeenCalledWith('/:_id/parties/buyer', caseController.getBuyerPartyDetails);

    expect(get).toHaveBeenCalledWith('/:_id/parties/agent', caseController.getAgentPartyDetails);

    expect(get).toHaveBeenCalledWith('/:_id/parties/indemnifier', caseController.getIndemnifierPartyDetails);

    expect(get).toHaveBeenCalledWith('/:_id/parties/bond-issuer', caseController.getBondIssuerPartyDetails);

    expect(get).toHaveBeenCalledWith('/:_id/parties/bond-beneficiary', caseController.getBondBeneficiaryPartyDetails);

    expect(get).toHaveBeenCalledWith('/:_id/documents', caseController.getCaseDocuments);

    expect(get).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk', underwritingController.getUnderWritingPricingAndRisk);

    expect(get).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/edit', underwritingController.getUnderWritingPricingAndRiskEdit);

    expect(get).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/loss-given-default', underwritingController.getUnderWritingLossGivenDefault);

    expect(get).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/probability-of-default', underwritingController.getUnderWritingProbabilityOfDefault);

    expect(get).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/facility/:facilityId/risk-profile', underwritingController.getUnderWritingFacilityRiskProfileEdit);

    expect(get).toHaveBeenCalledWith('/:_id/underwriting/lead-underwriter', underwritingController.getLeadUnderwriter);

    expect(get).toHaveBeenCalledWith('/:_id/underwriting/bank-security', underwritingController.getUnderWritingBankSecurity);

    expect(get).toHaveBeenCalledWith('/:_id/underwriting/managers-decision', underwritingController.getUnderwriterManagersDecision);

    expect(get).toHaveBeenCalledWith('/:_id/underwriting/managers-decision/edit', underwritingController.getUnderwriterManagersDecisionEdit);


    // POST routes
    expect(post).toHaveBeenCalledTimes(13);

    expect(post).toHaveBeenCalledWith('/:_id/tasks', caseController.filterCaseTasks);

    expect(post).toHaveBeenCalledWith('/:_id/tasks/:groupId/:taskId', caseController.putCaseTask);

    expect(post).toHaveBeenCalledWith('/:_id/parties/exporter', caseController.postExporterPartyDetails);

    expect(post).toHaveBeenCalledWith('/:_id/parties/buyer', caseController.postBuyerPartyDetails);

    expect(post).toHaveBeenCalledWith('/:_id/parties/agent', caseController.postAgentPartyDetails);

    expect(post).toHaveBeenCalledWith('/:_id/parties/indemnifier', caseController.postIndemnifierPartyDetails);

    expect(post).toHaveBeenCalledWith('/:_id/parties/bond-issuer', caseController.postTfmFacility);

    expect(post).toHaveBeenCalledWith('/:_id/parties/bond-beneficiary', caseController.postTfmFacility);

    expect(post).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/edit', underwritingController.postUnderWritingPricingAndRisk);

    expect(post).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/loss-given-default', underwritingController.postUnderWritingLossGivenDefault);

    expect(post).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/probability-of-default', underwritingController.postUnderWritingProbabilityOfDefault);

    expect(post).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/facility/:facilityId/risk-profile', underwritingController.postUnderWritingFacilityRiskProfileEdit);

    expect(post).toHaveBeenCalledWith('/:_id/underwriting/managers-decision/edit', underwritingController.postUnderwriterManagersDecision);
  });
});
