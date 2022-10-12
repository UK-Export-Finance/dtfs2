const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const CONSTANTS = require('../../../src/constants');

const newDeal = {
  dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
  status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
};

describe('/v1/portal/gef/deals', () => {
  beforeAll(async () => {
    await wipeDB.wipe(['deals', 'facilities']);
  });

  describe('POST /v1/portal/gef/deals', () => {
    it('creates a deal', async () => {
      const { body, status } = await api.post(newDeal).to('/v1/portal/gef/deals');

      expect(status).toEqual(200);

      expect(body).toEqual({ _id: expect.any(String) });

      const { body: dealAfterCreation } = await api.get(`/v1/portal/gef/deals/${body._id}`);

      expect(dealAfterCreation).toEqual({
        _id: body._id,
        ...newDeal,
      });
    });
  });
});
