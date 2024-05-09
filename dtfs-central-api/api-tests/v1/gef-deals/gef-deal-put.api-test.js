const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const CONSTANTS = require('../../../src/constants');
const { MOCK_PORTAL_USER } = require('../../mocks/test-users/mock-portal-user');

describe('/v1/portal/gef/deals/:id', () => {
  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
  });

  const newDeal = {
    dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
    status: 'Draft',
  };
  // Update GEF deal
  describe('PUT /v1/portal/gef/deals/:id', () => {
    it('Returns 404 when the deal does not exist ', async () => {
      const invalidDealId = '123456789f0ffe00219319c1';
      const { status } = await api.put({}).to(`/v1/portal/gef/deals/${invalidDealId} `);

      expect(status).toEqual(404);
    });

    it('Return and update the GEF deal', async () => {
      const postResult = await api.post(newDeal).to('/v1/portal/gef/deals');
      const createdDeal = postResult.body;
      const dealId = createdDeal._id;

      const updatedDeal = {
        ...newDeal,
        dealType: 'GEF',
        additionalRefName: 'change this field',
        eligibility: {
          ...newDeal.eligibility,
          mockNewField: true,
        },
      };

      const { status, body } = await api.put({ dealUpdate: updatedDeal, user: MOCK_PORTAL_USER }).to(`/v1/portal/gef/deals/${dealId}`);

      expect(status).toEqual(200);

      expect(body.additionalRefName).toEqual('change this field');
      expect(body.eligibility.mockNewField).toEqual(true);
    });
  });
});
