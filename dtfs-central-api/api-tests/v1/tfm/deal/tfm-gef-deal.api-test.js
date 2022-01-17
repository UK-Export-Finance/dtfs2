const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const CONSTANTS = require('../../../../src/constants');

const newDeal = {
  dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
  status: 'Draft',
  submissionCount: 0,
};

describe('/v1/tfm/deal/:id', () => {
  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
    await wipeDB.wipe(['tfm-deals']);
    await wipeDB.wipe(['tfm-facilities']);
  });

  describe('GET /v1/tfm/deal/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.get('/v1/tfm/deals/12345678910');
      expect(status).toEqual(404);
    });

    it('returns the requested resource', async () => {
      const postResult = await api.post(newDeal).to('/v1/portal/gef/deals');
      const dealId = postResult.body._id;

      await api.put({
        dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
        dealId,
      }).to('/v1/tfm/deals/submit');

      const { status, body } = await api.get(`/v1/tfm/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.deal.dealSnapshot).toMatchObject(newDeal);
    });
  });

  describe('PUT /v1/tfm/deal/:id/snapshot', () => {
    it('404s if updating an unknown id', async () => {
      const { status } = await api.put({}).to('/v1/tfm/deals/12345678/snapshot');
      expect(status).toEqual(404);
    });

    it('updates deal.dealSnapshot whilst retaining deal.tfm', async () => {
      const { body: createDealBody } = await api.post(newDeal).to('/v1/portal/gef/deals');
      const dealId = createDealBody._id;

      const mockTfm = {
        tfm: {
          submissionDetails: {
            exporterPartyUrn: '12345',
          },
        },
      };

      await api.put({
        dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
        dealId,
      }).to('/v1/tfm/deals/submit');

      // add some dummy data to deal.tfm
      await api.put({
        dealUpdate: mockTfm,
      }).to(`/v1/tfm/deals/${dealId}`);

      const snapshotUpdate = {
        someNewField: true,
        testing: true,
      };

      const { status, body } = await api.put(snapshotUpdate).to(`/v1/tfm/deals/${dealId}/snapshot`);

      expect(status).toEqual(200);
      expect(body.dealSnapshot).toMatchObject({
        ...newDeal,
        ...snapshotUpdate,
      });
      expect(body.tfm).toEqual({
        ...mockTfm.tfm,
        lastUpdated: expect.any(Number),
      });
    });
  });
});
