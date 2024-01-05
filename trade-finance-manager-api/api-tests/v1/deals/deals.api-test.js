const { findOneTfmDeal, findOnePortalDeal, getDeals } = require('../../../src/v1/controllers/deal.controller');
const mapDeal = require('../../../src/v1/mappings/map-deal');
const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const { mockFindOneDeal, mockQueryDeals } = require('../../../src/v1/__mocks__/common-api-mocks');
const api = require('../../../src/v1/api');
const ALL_MOCK_DEALS = require('../../../src/v1/__mocks__/mock-deals');
const { dealsLightReducer } = require('../../../src/v1/rest-mappings/deals-light');

jest.mock('../../../src/v1/rest-mappings/deals-light');

const mappedDeal = mapDeal(MOCK_DEAL);

const mockTfmDeals = ALL_MOCK_DEALS.map((deal) => ({ _id: deal._id, dealSnapshot: deal, tfm: { supplyContractValueInGBP: 1 } }));
const mockPagination = {
  totalItems: 3,
  currentPage: 0,
  totalPages: 1,
};

describe('deal controller', () => {
  beforeEach(() => {
    api.findOneDeal.mockReset();
    mockFindOneDeal();

    dealsLightReducer.mockReset();
    dealsLightReducer.mockImplementation((deals) => deals);
  });

  describe('find one TFM deal', () => {
    it("should return false if deal doesn't exist", async () => {
      const deal = await findOneTfmDeal('NO_DEAL_ID');
      expect(deal).toEqual(false);
    });

    it('should return a deal', async () => {
      const deal = await findOneTfmDeal(MOCK_DEAL._id);
      expect(deal).toMatchObject({
        dealSnapshot: mappedDeal,
      });
    });
  });

  describe('find one Portal deal', () => {
    it("should return false if deal doesn't exist", async () => {
      const deal = await findOnePortalDeal('NO_DEAL_ID');
      expect(deal).toEqual(false);
    });

    it('should fetch a portal deal', async () => {
      const deal = await findOnePortalDeal(MOCK_DEAL._id);
      expect(deal).toEqual(MOCK_DEAL);
    });
  });

  describe('get all TFM deals', () => {
    it('returns all deals', async () => {
      api.queryDeals.mockReset();

      mockQueryDeals(mockTfmDeals, mockPagination);

      const queryParams = {};
      const req = { query: queryParams };
      const res = {
        send: jest.fn(),
        status: jest.fn(() => res),
      };

      await getDeals(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(dealsLightReducer).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith({ deals: mockTfmDeals, pagination: mockPagination });
    });
  });
});
