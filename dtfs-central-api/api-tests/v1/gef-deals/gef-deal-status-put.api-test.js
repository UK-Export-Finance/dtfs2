const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const CONSTANTS = require('../../../src/constants');

describe('/v1/portal/gef/deals/:id/status', () => {
  beforeAll(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['gef-facilities']);
  });

  const mockDeal = {
    dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
    status: 'Draft',
    updatedAt: 1234.0,
  };

  describe('PUT /v1/portal/gef/deals/:id/status', () => {
    it('updates a deal status and previousStatus', async () => {
      const { body: createdDeal } = await api.post(mockDeal).to('/v1/portal/gef/deals');

      const dealId = createdDeal._id;

      const statusUpdate = { status: 'ACKNOWLEDGED' };
      const { body, status } = await api.put(statusUpdate).to(`/v1/portal/gef/deals/${dealId}/status `);

      expect(status).toEqual(200);

      expect(body.status).toEqual(statusUpdate.status);
      expect(body.previousStatus).toEqual(mockDeal.status);
      expect(body.updatedAt).not.toEqual(mockDeal.updatedAt);
      expect(typeof body.updatedAt).toEqual('number');
    });

    it('returns 400 bad request status code when the new status is same as application\'s existing status', async () => {
      // Create new GEF deal
      const { body: createdDeal } = await api.post(mockDeal).to('/v1/portal/gef/deals');
      const dealId = createdDeal._id;

      // First status update
      let statusUpdate = { status: 'ACKNOWLEDGED' };
      const { status } = await api.put(statusUpdate).to(`/v1/portal/gef/deals/${dealId}/status `);
      expect(status).toEqual(200);

      // Second status update
      statusUpdate = { status: 'ACKNOWLEDGED' };
      const { status: secondStatus } = await api.put(statusUpdate).to(`/v1/portal/gef/deals/${dealId}/status `);
      expect(secondStatus).toEqual(400);
    });

    it('returns 404 when deal does not exist ', async () => {
      const invalidDealId = '123456789f0ffe00219319c1';
      const { status } = await api.put({}).to(`/v1/portal/gef/deals/${invalidDealId}/status `);

      expect(status).toEqual(404);
    });
  });
});
