const { findOneTfmDeal, findOnePortalDeal } = require('../../../server/v1/controllers/deal.controller');
const mapDeal = require('../../../server/v1/mappings/map-deal');
const { MOCK_BSS_EWCS_DEAL } = require('../../../server/v1/__mocks__/mock-deal');
const { mockFindOneDeal } = require('../../../server/v1/__mocks__/common-api-mocks');
const api = require('../../../server/v1/api');

describe('deal controller', () => {
  beforeEach(() => {
    api.findOneDeal.mockReset();

    mockFindOneDeal();
  });

  describe('findOneTfmDeal', () => {
    it('should return false if the deal does not exist', async () => {
      // Arrange
      const deal = await findOneTfmDeal('NO_DEAL_ID');

      // Act
      expect(deal).toEqual(false);
    });

    it('should return a deal with mapped dealSnapshot', async () => {
      // Arrange
      const deal = await findOneTfmDeal(MOCK_BSS_EWCS_DEAL._id);

      // Act
      const mappedSnapshot = await mapDeal(MOCK_BSS_EWCS_DEAL);

      // Assert
      expect(deal).toMatchObject({
        dealSnapshot: mappedSnapshot,
      });
    });
  });

  describe('findOnePortalDeal', () => {
    it('should return false if the deal does not exist', async () => {
      // Act
      const deal = await findOnePortalDeal('NO_DEAL_ID');

      // Assert
      expect(deal).toEqual(false);
    });

    it('should fetch a portal deal', async () => {
      // Act
      const deal = await findOnePortalDeal(MOCK_BSS_EWCS_DEAL._id);

      // Assert
      expect(deal).toEqual(MOCK_BSS_EWCS_DEAL);
    });
  });
});
