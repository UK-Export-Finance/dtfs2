const { findOneTfmDeal, findOnePortalDeal } = require('../../../src/v1/controllers/deal.controller');
const mapDeal = require('../../../src/v1/mappings/map-deal');
const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');
const { mockFindOneDeal, mockUpdateDeal } = require('../../../src/v1/__mocks__/common-api-mocks');
const api = require('../../../src/v1/api');
const { dealsLightReducer } = require('../../../src/v1/rest-mappings/deals-light');
const mapDeals = require('../../../src/v1/mappings/map-deals');
const acbsController = require('../../../src/v1/controllers/acbs.controller');

jest.mock('../../../src/v1/rest-mappings/deals-light');
jest.mock('../../../src/v1/mappings/map-deals');

const mappedDeal = mapDeal(MOCK_DEAL);

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
});
