const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const CONSTANTS = require('../../../src/constants');

const newDeal = {
  dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
  status: 'Draft',
};

describe('/v1/portal/gef/deals', () => {
  beforeAll(async () => {
    await wipeDB.wipe(['gef-application']);
    await wipeDB.wipe(['gef-facilities']);
  });

  describe('POST /v1/portal/gef/deals', () => {
    it('returns the created deal with correct fields', async () => {
      const { body, status } = await api.post(newDeal).to('/v1/portal/gef/deals');

      expect(status).toEqual(200);

      const expected = {
        _id: expect.any(String),
        ...newDeal,
      };

      expect(body).toEqual(expected);
    });
  });
});
