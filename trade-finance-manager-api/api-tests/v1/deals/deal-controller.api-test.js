const { when } = require('jest-when');
const { findOneTfmDeal, findOnePortalDeal, getDeals, findTfmDealsLight, findTfmDeals, canDealBeSubmittedToACBS, updateTfmParty } = require('../../../src/v1/controllers/deal.controller');
const mapDeal = require('../../../src/v1/mappings/map-deal');
const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const { mockFindOneDeal, mockQueryDeals, mockUpdateDeal } = require('../../../src/v1/__mocks__/common-api-mocks');
const api = require('../../../src/v1/api');
const ALL_MOCK_DEALS = require('../../../src/v1/__mocks__/mock-deals');
const { dealsLightReducer } = require('../../../src/v1/rest-mappings/deals-light');
const mapDeals = require('../../../src/v1/mappings/map-deals');
const MOCK_DEAL_MIA_SUBMITTED = require('../../../src/v1/__mocks__/mock-deal-MIA-submitted');
const MOCK_DEAL_MIN_GEF = require('../../../src/v1/__mocks__/mock-gef-deal-MIN');
const MOCK_DEAL_AIN_SUBMITTED = require('../../../src/v1/__mocks__/mock-deal-AIN-submitted');
const acbsController = require('../../../src/v1/controllers/acbs.controller');

jest.mock('../../../src/v1/rest-mappings/deals-light');
jest.mock('../../../src/v1/mappings/map-deals');

const mappedDeal = mapDeal(MOCK_DEAL);

const mockTfmDealsReduced = ALL_MOCK_DEALS.map((deal) => ({ _id: deal._id, dealSnapshot: deal, tfm: { supplyContractValueInGBP: 1 }, reduced: true }));
const mockTfmDeals = mockTfmDealsReduced.map((deal) => { const { reduced: _removed, ...dealToReturn } = deal; return dealToReturn; });
const mockTfmDealsMapped = mockTfmDeals.map((deal) => ({ ...deal, mapped: true }));
const mockPagination = {
  totalItems: 3,
  currentPage: 0,
  totalPages: 1,
};

describe('deal controller', () => {
  acbsController.createACBS = jest.fn();

  beforeEach(() => {
    acbsController.createACBS.mockReset();

    api.findOneDeal.mockReset();
    mockFindOneDeal();

    api.updateDeal.mockReset();
    mockUpdateDeal();

    dealsLightReducer.mockReset();
    dealsLightReducer.mockImplementation((deals) => deals.map((deal) => ({ ...deal, reduced: true })));

    mapDeals.mockReset();
    mapDeals.mockImplementation((deals) => deals.map((deal) => ({ ...deal, mapped: true })));
  });

  describe('findOneTfmDeal', () => {
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

  describe('findOnePortalDeal', () => {
    it("should return false if deal doesn't exist", async () => {
      const deal = await findOnePortalDeal('NO_DEAL_ID');
      expect(deal).toEqual(false);
    });

    it('should fetch a portal deal', async () => {
      const deal = await findOnePortalDeal(MOCK_DEAL._id);
      expect(deal).toEqual(MOCK_DEAL);
    });
  });

  describe('getDeals', () => {
    it('returns all TFM deals (in reduced form)', async () => {
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

  describe('findTfmDealsLight', () => {
    it('returns all TFM deals', async () => {
      api.queryDeals.mockReset();
      mockQueryDeals(mockTfmDeals, mockPagination);

      const queryParams = {};

      const response = await findTfmDealsLight(queryParams);

      expect(api.queryDeals).toHaveBeenCalledWith({ queryParams });
      expect(api.queryDeals).toHaveBeenCalledTimes(1);
      expect(response).toStrictEqual({ deals: mockTfmDeals, pagination: mockPagination });
    });

    it('returns undefined for both deals and pagination if getting the deals returns a falsy value', async () => {
      api.queryDeals.mockReset();
      mockQueryDeals(false, mockPagination);

      const queryParams = {};

      const response = await findTfmDealsLight(queryParams);

      expect(api.queryDeals).toHaveBeenCalledWith({ queryParams });
      expect(api.queryDeals).toHaveBeenCalledTimes(1);
      expect(response).toStrictEqual({ deals: undefined, pagination: undefined });
    });

    it('does not catch the error if getting the deals throws an error', async () => {
      const error = new Error('an error message');

      api.queryDeals.mockReset();
      when(api.queryDeals).calledWith(expect.anything()).mockImplementation(() => {
        throw error;
      });

      const queryParams = {};

      await expect(findTfmDealsLight(queryParams)).rejects.toThrow(error);
    });
  });

  describe('findTfmDeals', () => {
    it('returns all TFM deals (in mapped form)', async () => {
      api.queryDeals.mockReset();
      mockQueryDeals(mockTfmDeals, mockPagination);

      const queryParams = {};

      const response = await findTfmDeals(queryParams);

      expect(api.queryDeals).toHaveBeenCalledWith({ queryParams });
      expect(api.queryDeals).toHaveBeenCalledTimes(1);
      expect(response).toStrictEqual({ deals: mockTfmDealsMapped, pagination: mockPagination });
    });

    it('returns undefined for both deals and pagination if getting the deals returns a falsy value', async () => {
      api.queryDeals.mockReset();
      mockQueryDeals(false, mockPagination);

      const queryParams = {};

      const response = await findTfmDealsLight(queryParams);

      expect(api.queryDeals).toHaveBeenCalledWith({ queryParams });
      expect(api.queryDeals).toHaveBeenCalledTimes(1);
      expect(response).toStrictEqual({ deals: undefined, pagination: undefined });
    });

    it('does not catch the error if getting the deals throws an error', async () => {
      const error = new Error('an error message');

      api.queryDeals.mockReset();
      when(api.queryDeals).calledWith(expect.anything()).mockImplementation(() => {
        throw error;
      });

      const queryParams = {};

      await expect(findTfmDealsLight(queryParams)).rejects.toThrow(error);
    });
  });

  describe('canDealBeSubmittedToACBS', () => {
    it('returns false if the deal is a MIA', () => {
      expect(canDealBeSubmittedToACBS(MOCK_DEAL_MIA_SUBMITTED.submissionType)).toEqual(false);
    });

    it('returns true if the deal is a MIN', () => {
      expect(canDealBeSubmittedToACBS(MOCK_DEAL_MIN_GEF.submissionType)).toEqual(true);
    });

    it('returns true if the deal is an AIN', () => {
      expect(canDealBeSubmittedToACBS(MOCK_DEAL_AIN_SUBMITTED.submissionType)).toEqual(true);
    });
  });

  describe('updateTfmParty', () => {
    it('calls `createACBS` when the deal is an AIN and the exporter has a URN', async () => {
      const tfmUpdate = { exporter: { partyUrn: '123' } };
      await updateTfmParty(MOCK_DEAL_AIN_SUBMITTED._id, tfmUpdate);

      expect(acbsController.createACBS).toHaveBeenCalled();
    });

    it('calls `createACBS` when the deal is a MIN and the exporter has a URN', async () => {
      const tfmUpdate = { exporter: { partyUrn: '123' } };
      await updateTfmParty(MOCK_DEAL_MIN_GEF._id, tfmUpdate);

      expect(acbsController.createACBS).toHaveBeenCalled();
    });

    it('does NOT call `createACBS` when the deal is a MIA and the exporter has a URN', async () => {
      const tfmUpdate = { exporter: { partyUrn: '123' } };
      await updateTfmParty(MOCK_DEAL_MIA_SUBMITTED._id, tfmUpdate);

      expect(acbsController.createACBS).not.toHaveBeenCalled();
    });

    it('does NOT call `createACBS` when the deal is a MIA and the exporter does not have a URN', async () => {
      const tfmUpdate = { exporter: { partyUrn: '' } };
      await updateTfmParty(MOCK_DEAL_MIA_SUBMITTED._id, tfmUpdate);

      expect(acbsController.createACBS).not.toHaveBeenCalled();
    });
  });
});
