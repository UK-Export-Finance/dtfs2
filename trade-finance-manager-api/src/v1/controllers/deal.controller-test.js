const MOCK_DEAL_MIA_SUBMITTED = require('../__mocks__/mock-deal-MIA-submitted');

const dealController = require('./deal.controller');

describe('dealCanBeSubmittedToACBS()', () => {
  it('Should ascertain whether the deal can be submitted to the ACBS', async () => {
    expect(dealController.dealCanBeSubmittedToACBS(MOCK_DEAL_MIA_SUBMITTED)).toEqual(false);
  });
});
