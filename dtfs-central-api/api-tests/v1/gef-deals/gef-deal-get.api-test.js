const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const { testApi } = require('../../test-api');
const { DEALS } = require('../../../src/constants');

const newDeal = {
  dealType: DEALS.DEAL_TYPE.GEF,
  status: 'Draft',
};

describe('/v1/portal/gef/deals/:id', () => {
  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
  });

  describe('GET /v1/portal/gef/deals/:id', () => {
    it('returns 404 when the deal is not found', async () => {
      const invalidDealId = '123456789f0ffe00219319c1';

      const { status } = await testApi.get(`/v1/portal/gef/deals/${invalidDealId}`);

      expect(status).toEqual(404);
    });

    it('returns the deal', async () => {
      const { body: createdDeal } = await testApi.post(newDeal).to('/v1/portal/gef/deals');

      const { body, status } = await testApi.get(`/v1/portal/gef/deals/${createdDeal._id}`);

      expect(status).toEqual(200);

      expect(body).toEqual({
        _id: createdDeal._id,
        ...newDeal,
      });
    });
  });
});
