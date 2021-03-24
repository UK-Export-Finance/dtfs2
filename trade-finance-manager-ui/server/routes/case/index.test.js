import {
  get,
  post,
} from '../../test-mocks/router-mock';
import caseController from '../../controllers/case';

describe('routes - case', () => {
  beforeEach(() => {
    require('./index'); // eslint-disable-line global-require
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should setup routes with controllers', () => {
    // GET routes
    expect(get).toHaveBeenCalledTimes(13);

    expect(get).toHaveBeenCalledWith('/:_id/deal', caseController.getCaseDeal);

    expect(get).toHaveBeenCalledWith('/:_id/tasks', caseController.getCaseTasks);

    expect(get).toHaveBeenCalledWith('/:_id/tasks/:taskId', caseController.getCaseTask);

    expect(get).toHaveBeenCalledWith('/:_id/facility/:facilityId', caseController.getCaseFacility);

    expect(get).toHaveBeenCalledWith('/:_id/parties', caseController.getCaseParties);

    expect(get).toHaveBeenCalledWith('/:_id/parties/exporter', caseController.getExporterPartyDetails);

    expect(get).toHaveBeenCalledWith('/:_id/parties/buyer', caseController.getBuyerPartyDetails);

    expect(get).toHaveBeenCalledWith('/:_id/parties/agent', caseController.getAgentPartyDetails);

    expect(get).toHaveBeenCalledWith('/:_id/parties/indemnifier', caseController.getIndemnifierPartyDetails);

    expect(get).toHaveBeenCalledWith('/:_id/parties/bond-issuer', caseController.getBondIssuerPartyDetails);

    expect(get).toHaveBeenCalledWith('/:_id/parties/bond-beneficiary', caseController.getBondBeneficiaryPartyDetails);

    expect(get).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk', caseController.getUnderWritingPricingAndRisk);

    expect(get).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/edit', caseController.getUnderWritingPricingAndRiskEdit);

    // POST routes
    expect(post).toHaveBeenCalledTimes(8);

    expect(post).toHaveBeenCalledWith('/:_id/tasks/:taskId', caseController.putCaseTask);

    expect(post).toHaveBeenCalledWith('/:_id/parties/exporter', caseController.postExporterPartyDetails);

    expect(post).toHaveBeenCalledWith('/:_id/parties/buyer', caseController.postBuyerPartyDetails);

    expect(post).toHaveBeenCalledWith('/:_id/parties/agent', caseController.postAgentPartyDetails);

    expect(post).toHaveBeenCalledWith('/:_id/parties/indemnifier', caseController.postIndemnifierPartyDetails);

    expect(post).toHaveBeenCalledWith('/:_id/parties/bond-issuer', caseController.postTfmFacility);

    expect(post).toHaveBeenCalledWith('/:_id/parties/bond-beneficiary', caseController.postTfmFacility);

    expect(post).toHaveBeenCalledWith('/:_id/underwriting/pricing-and-risk/edit', caseController.postUnderWritingPricingAndRisk);
  });
});
