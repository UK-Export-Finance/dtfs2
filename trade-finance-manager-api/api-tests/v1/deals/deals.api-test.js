const { findOneDeal } = require('../../../src/v1/controllers/deal.controller');
const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');

describe('deal controller', () => {
  describe('find one deal', () => {
    it('should return false if deal doesn\'t exist', async () => {
      const deal = await findOneDeal('NO_DEAL_ID');
      expect(deal).toEqual(false);
    });

    it('should return a deal', async () => {
      const deal = await findOneDeal(MOCK_DEAL._id);
      expect(deal).toEqual(MOCK_DEAL);
    });
  });
});
