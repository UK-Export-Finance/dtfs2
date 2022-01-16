const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const CONSTANTS = require('../../../src/constants');

const newDeal = {
  dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
  status: 'Draft',
};

describe('/v1/portal/gef/deals/:id', () => {
  beforeAll(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
  });

  describe('GET /v1/portal/gef/deals/:id', () => {
    it('returns 404 when the deal is not found', async () => {
      const invalidDealId = '123456789f0ffe00219319c1';

      const { status } = await api.get(`/v1/portal/gef/deals/${invalidDealId}`);

      expect(status).toEqual(404);
    });

    it('returns the deal', async () => {
      const { body: createdDeal } = await api.post(newDeal).to('/v1/portal/gef/deals');

      const { body, status } = await api.get(`/v1/portal/gef/deals/${createdDeal._id}`);

      expect(status).toEqual(200);

      expect(body).toEqual({
        _id: createdDeal._id,
        ...newDeal,
      });
    });
  });
});
