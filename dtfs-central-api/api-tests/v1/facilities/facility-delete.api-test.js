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

describe('/v1/portal/facilities', () => {
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

  describe('DELETE /v1/portal/facilities/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.remove({}).to('/v1/portal/facilities/12345678910');

      expect(status).toEqual(404);
    });

    it('deletes the facility', async () => {
      const { body } = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');

      const {
        associatedDealId,
        _id: facilityId,
      } = body;

      const removeBody = {
        associatedDealId,
        user: mockUser,
      };

      const deleteResponse = await api.remove(removeBody).to(`/v1/portal/facilities/${body._id}`);
      expect(deleteResponse.status).toEqual(200);

      const { status } = await api.get(`/v1/portal/facilities/${body._id}`);

      expect(status).toEqual(404);
    });

    it('removes the facility id from the associated deal\'s facilities', async () => {
      const mockBond = {
        facilityType: 'bond',
        ...newFacility,
      };

      const mockLoan = {
        facilityType: 'loan',
        ...newFacility,
      };

      const createdBond = await api.post({ facility: mockBond, user: mockUser }).to('/v1/portal/facilities');
      const createdLoan = await api.post({ facility: mockLoan, user: mockUser }).to('/v1/portal/facilities');

      // make sure we've got facilities added to the deal
      const getDealResponse = await api.get(`/v1/portal/deals/${newFacility.associatedDealId}`);
      expect(getDealResponse.body.deal.facilities.length).toEqual(2);

      // delete a bond facility
      const {
        associatedDealId,
        _id: facilityId,
      } = createdBond.body;

      const removeBondBody = {
        associatedDealId,
        user: mockUser,
      };

      const deleteResponse = await api.remove({ user: mockUser }).to(`/v1/portal/facilities/${facilityId}`);
      expect(deleteResponse.status).toEqual(200);

      // check the deal's facilities array
      const { body: getDealBody } = await api.get(`/v1/portal/deals/${newFacility.associatedDealId}`);
      expect(getDealBody.deal.facilities.length).toEqual(1);
      expect(getDealBody.deal.facilities[0]).toEqual(createdLoan.body._id);
    });
  });
});
