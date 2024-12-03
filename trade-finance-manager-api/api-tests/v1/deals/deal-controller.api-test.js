const { findOneTfmDeal, findOnePortalDeal } = require('../../../src/v1/controllers/deal.controller');
const mapDeal = require('../../../src/v1/mappings/map-deal');
const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const { mockFindOneDeal } = require('../../../src/v1/__mocks__/common-api-mocks');
const api = require('../../../src/v1/api');

describe('deal controller', () => {
  beforeEach(() => {
    api.findOneDeal.mockReset();

    mockFindOneDeal();
  });

  describe('findOneTfmDeal', () => {
    it('should return false if the deal does not exist', async () => {
      const deal = await findOneTfmDeal('NO_DEAL_ID');
      expect(deal).toEqual(false);
    });

    it('should return a deal with mapped dealSnapshot', async () => {
      const deal = await findOneTfmDeal(MOCK_DEAL._id);

      const mappedSnapshot = await mapDeal(MOCK_DEAL);

      expect(deal).toMatchObject({
        dealSnapshot: mappedSnapshot,
      });
    });
  });

  describe('findOnePortalDeal', () => {
    it('should return false if the deal does not exist', async () => {
      const deal = await findOnePortalDeal('NO_DEAL_ID');
      expect(deal).toEqual(false);
    });

    it('should fetch a portal deal', async () => {
      const deal = await findOnePortalDeal(MOCK_DEAL._id);
      expect(deal).toEqual(MOCK_DEAL);
    });
  });
});
