const { findOneTfmDeal, findOnePortalDeal } = require('../../../src/v1/controllers/deal.controller');
const mapDeal = require('../../../src/v1/mappings/map-deal');
const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const { mockFindOneDeal } = require('../../../src/v1/__mocks__/common-api-mocks');
const api = require('../../../src/v1/api');

const mappedDeal = mapDeal(MOCK_DEAL);

describe('deal controller', () => {
  beforeAll(() => {
    api.findOneDeal.mockReset();
  });

  afterEach(() => {
    api.findOneDeal.mockReset();
  });

  describe('find one TFM deal', () => {
    it("should return false if deal doesn't exist", async () => {
      mockFindOneDeal();
      const deal = await findOneTfmDeal('NO_DEAL_ID');
      expect(deal).toEqual(false);
    });

    it('should return a deal', async () => {
      mockFindOneDeal();
      const deal = await findOneTfmDeal(MOCK_DEAL._id);
      expect(deal).toMatchObject({
        dealSnapshot: mappedDeal,
      });
    });
  });

  describe('find one Portal deal', () => {
    it("should return false if deal doesn't exist", async () => {
      mockFindOneDeal();
      const deal = await findOnePortalDeal('NO_DEAL_ID');
      expect(deal).toEqual(false);
    });

    it('should fetch a portal deal', async () => {
      mockFindOneDeal();
      const deal = await findOnePortalDeal(MOCK_DEAL._id);
      expect(deal).toEqual(MOCK_DEAL);
    });
  });
});
