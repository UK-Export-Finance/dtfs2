const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const CONSTANTS = require('../../../src/constants');

const newDeal = {
  dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
  status: 'Draft',
};

describe('/v1/portal/gef/deals/:id/status', () => {
  beforeAll(async () => {
    await wipeDB.wipe(['gef-application']);
    await wipeDB.wipe(['gef-facilities']);
  });

  describe('PUT /v1/portal/gef/deals/:id/status', () => {
    it('updates a deal status and previousStatus', async () => {
      const { body: createdDeal } = await api.post(newDeal).to('/v1/portal/gef/deals');

      const dealId = createdDeal._id;

      const statusUpdate = { status: 'ACKNOWLEDGED' };
      const { body, status } = await api.put(statusUpdate).to(`/v1/portal/gef/deals/${dealId}/status `);

      expect(status).toEqual(200);
      
      expect(body.status).toEqual(statusUpdate.status);
      expect(body.previousStatus).toEqual(newDeal.status);
    });

    it('returns 404 when deal does not exist ', async () => {
      const invalidDealId = '123456789f0ffe00219319c1';
      const { status } = await api.put({}).to(`/v1/portal/gef/deals/${invalidDealId}/status `);

      expect(status).toEqual(404);
    });
  });
});
