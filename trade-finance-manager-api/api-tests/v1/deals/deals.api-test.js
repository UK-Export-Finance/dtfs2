const { when } = require('jest-when');
const { findOneTfmDeal, findOnePortalDeal, getDeals } = require('../../../src/v1/controllers/deal.controller');
const mapDeal = require('../../../src/v1/mappings/map-deal');
const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const { mockFindOneDeal, mockQueryDeals } = require('../../../src/v1/__mocks__/common-api-mocks');
const api = require('../../../src/v1/api');
const ALL_MOCK_DEALS = require('../../../src/v1/__mocks__/mock-deals');
const { dealsLightReducer } = require('../../../src/v1/rest-mappings/deals-light');

jest.mock('../../../src/v1/rest-mappings/deals-light');

const mappedDeal = mapDeal(MOCK_DEAL);

const mockTfmDealsReduced = ALL_MOCK_DEALS.map((deal) => ({ _id: deal._id, dealSnapshot: deal, tfm: { supplyContractValueInGBP: 1 }, reduced: true }));
const mockTfmDeals = mockTfmDealsReduced.map((deal) => { const { reduced: _removed, ...dealToReturn } = deal; return dealToReturn; });
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
    dealsLightReducer.mockImplementation((deals) => deals.map((deal) => ({ ...deal, reduced: true })));
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

      const mockSend = jest.fn();
      const res = {
        send: mockSend,
        status: jest.fn().mockReturnThis(),
      };
      when(mockSend).calledWith({ deals: mockTfmDealsReduced, pagination: mockPagination }).mockResolvedValueOnce('all deals');

      const response = await getDeals(req, res);

      expect(api.queryDeals).toHaveBeenCalledWith({ queryParams });
      expect(api.queryDeals).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(response).toBe('all deals');
    });

    it('returns a 500 response with the error message if getting the deals throws an error', async () => {
      const error = new Error('an error message');

      api.queryDeals.mockReset();
      when(api.queryDeals).calledWith(expect.anything()).mockImplementation(() => {
        throw error;
      });

      const queryParams = {};
      const req = { query: queryParams };

      const mockSend = jest.fn();
      const res = {
        send: mockSend,
        status: jest.fn().mockReturnThis(),
      };
      when(mockSend).calledWith('an error message').mockResolvedValueOnce('the error message');

      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

      const response = await getDeals(req, res);

      expect(mockConsoleError).toHaveBeenCalledWith(`Error fetching deals: ${error}`);
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(response).toBe('the error message');

      mockConsoleError.mockRestore();
    });
  });
});
