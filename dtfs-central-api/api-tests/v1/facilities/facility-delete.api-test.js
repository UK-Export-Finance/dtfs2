const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const aDeal = require('../deal-builder');

const mockUser = {
  _id: '123456789',
  username: 'temp',
  roles: [],
  bank: {
    id: '956',
    name: 'Barclays Bank',
  },
};

let newBondFacility = {
  facilityType: 'bond',
};

let bondFacilityId;

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

describe('/v1/portal/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
  });

  beforeEach(async () => {
    const deal = await createDeal();

    dealId = deal._id;
    newBondFacility.associatedDealId = dealId;
    
    const { body } = await api.post({ facility: newBondFacility, user: mockUser }).to('/v1/portal/facilities');

    bondFacilityId = body._id;
  });

  describe('DELETE /v1/portal/facilities/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.remove({}).to('/v1/portal/facilities/12345678910');

      expect(status).toEqual(404);
    });

    it('deletes the facility', async () => {
      const removeBody = {
        associatedDealId: newBondFacility.associatedDealId,
        user: mockUser,
      };

      const deleteResponse = await api.remove(removeBody).to(`/v1/portal/facilities/${bondFacilityId}`);
      expect(deleteResponse.status).toEqual(200);

      expect(deleteResponse.body.ok).toEqual(1);
    });
  });
});
