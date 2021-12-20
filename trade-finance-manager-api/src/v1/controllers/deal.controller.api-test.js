const MOCK_DEAL_MIA_SUBMITTED = require('../__mocks__/mock-deal-MIA-submitted');
const MOCK_DEAL_MIN_GEF = require('../__mocks__/mock-gef-deal-MIN');
const MOCK_DEAL_AIN_SUBMITTED = require('../__mocks__/mock-deal-AIN-submitted');

const dealController = require('./deal.controller');

describe('canDealBeSubmittedToACBS()', () => {
  it('Should return `FALSE` as the deal is a MIA', async () => {
    expect(dealController.canDealBeSubmittedToACBS(MOCK_DEAL_MIA_SUBMITTED.submissionType)).toEqual(false);
  });
  it('Should return `TRUE` as the deal is a MIN', async () => {
    expect(dealController.canDealBeSubmittedToACBS(MOCK_DEAL_MIN_GEF.submissionType)).toEqual(true);
  });
  it('Should return `TRUE` as the deal is a AIN', async () => {
    expect(dealController.canDealBeSubmittedToACBS(MOCK_DEAL_AIN_SUBMITTED.submissionType)).toEqual(true);
  });
});
