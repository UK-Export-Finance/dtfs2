const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const { TestApi } = require('../../test-api');
const CONSTANTS = require('../../../src/constants');

const newDeal = {
  dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
  status: 'Draft',
};

describe('/v1/portal/gef/deals', () => {
  beforeAll(async () => {
    await TestApi.initialise();

    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
  });

  describe('POST /v1/portal/gef/deals', () => {
    it('creates a deal', async () => {
      const { body, status } = await TestApi.post(newDeal).to('/v1/portal/gef/deals');

      expect(status).toEqual(200);

      expect(body).toEqual({ _id: expect.any(String) });

      const { body: dealAfterCreation } = await TestApi.get(`/v1/portal/gef/deals/${body._id}`);

      expect(dealAfterCreation).toEqual({
        _id: body._id,
        ...newDeal,
      });
    });
  });
});
