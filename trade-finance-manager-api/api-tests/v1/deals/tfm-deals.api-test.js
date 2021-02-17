const { updateTfmParty } = require('../../../src/v1/controllers/tfm.controller');
const mapDeal = require('../../../src/v1/mappings/map-deal');
const MOCK_DEAL = require('../../../src/v1/__mocks__/mock-deal');

const mappedDeal = mapDeal(MOCK_DEAL);

describe('tfm controller', () => {
  describe('update TFM data', () => {
    it('should update a party', async () => {
      const deal = await updateTfmParty(MOCK_DEAL._id, {
        exporter: {
          partyUrn: '1111',
        },
      });
      expect(deal).toMatchObject({
        tfm: {
          parties: {
            exporter: {
              partyUrn: '1111',
            },
          },
        },
      });
    });
  });
});
