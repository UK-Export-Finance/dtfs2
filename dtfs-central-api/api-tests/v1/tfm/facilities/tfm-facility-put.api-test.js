const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const aDeal = require('../../deal-builder');

const mockUser = {
  _id: '123456789',
  username: 'temp',
  roles: [],
  bank: {
    id: '956',
    name: 'Barclays Bank',
  },
};

const newFacility = {
  facilityType: 'bond',
  associatedDealId: '123123456',
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

const createDeal = async () => {
  const { body, status } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
  return body;
};

describe('/v1/tfm/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
  });

  beforeEach(async () => {
    const deal = await createDeal();

    dealId = deal._id;
    newFacility.associatedDealId = dealId;
  });

  describe('PUT /v1/tfm/facilities/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.put({ facility: newFacility, user: mockUser }).to('/v1/tfm/facilities/123456789012');
      expect(status).toEqual(404);
    });

    it('returns 404 when adding facility to non-existant deal', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      await api.put({}).to(`/v1/tfm/deals/${dealId}/submit`);

      const { status } = await api.put({ facility: newFacility, user: mockUser }).to('/v1/tfm/facilities/111111}');

      expect(status).toEqual(404);
    });

    it('returns the updated facility', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const createdFacility = postResult.body;

      const updatedFacility = {
        facilityUpdate: {
          bondIssuerPartyUrn: 'testUrn',
        },
      };

      await api.put({}).to(`/v1/tfm/deals/${dealId}/submit`);

      const { body, status } = await api.put(updatedFacility).to(`/v1/tfm/facilities/${createdFacility._id}`);

      expect(status).toEqual(200);
      expect(body.tfm).toEqual(updatedFacility.facilityUpdate);
    });
  });
});
