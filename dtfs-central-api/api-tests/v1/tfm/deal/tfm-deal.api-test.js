const wipeDB = require('../../../wipeDB');
const aDeal = require('../../deal-builder');

const app = require('../../../../src/createApp');
const api = require('../../../api')(app);

const mockUser = {
  _id: '123456789',
  username: 'temp',
  roles: [],
  bank: {
    id: '956',
    name: 'Barclays Bank',
  },
};

const newDeal = aDeal({
  details: {
    bankSupplyContractName: 'mock name',
    bankSupplyContractID: 'mock id',
  },
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
});

const dealUpdate = {
  tfm: {
    submissionDetails: {
      exporterPartyUrn: '12345',
    },
  },
};

describe('/v1/portal/deals', () => {
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

    it('404s if submitting an unknown id', async () => {
      const { status } = await api.put({}).to('/v1/tfm/deals/12345678/submit');
      expect(status).toEqual(404);
    });

    it('returns the requested resource', async () => {
      const postResult = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const dealId = postResult.body._id;

      const submitDeal = await api.put({}).to(`/v1/tfm/deals/${dealId}/submit`);

      const { status, body } = await api.get(`/v1/tfm/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.deal.dealSnapshot).toMatchObject(newDeal);
    });
  });

  describe('PUT /v1/tfm/deals', () => {
    it('404s if updating an unknown id', async () => {
      const { status } = await api.put({ dealUpdate }).to('/v1/tfm/deals/12345678');
      expect(status).toEqual(404);
    });

    it('updates the created deal with correct fields', async () => {
      const { body: portalDeal } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
      const dealId = portalDeal._id;

      await api.put({}).to(`/v1/tfm/deals/${dealId}/submit`);

      const { status, body } = await api.put({ dealUpdate }).to(`/v1/tfm/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.dealSnapshot).toMatchObject(newDeal);
      expect(body.tfm).toEqual(dealUpdate.tfm);
    });
  });
});
