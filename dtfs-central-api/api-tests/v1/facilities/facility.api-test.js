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

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);

    const deal = await createDeal();

    dealId = deal._id;
    newFacility.associatedDealId = dealId;
  });

  describe('POST /v1/portal/facilities', () => {
    it('returns 404 when associatedDeal/associatedDealId is not found', async () => {
      const facilityWithInvalidDealId = {
        associatedDealId: '1234',
        facilityType: 'bond',
      };

      const { body, status } = await api.post({ facility: facilityWithInvalidDealId, user: mockUser }).to('/v1/portal/facilities');

      expect(status).toEqual(404);
    });

    it('returns 404 when user is not found', async () => {
      const facilityWithInvalidDealId = {
        associatedDealId: '1234',
        facilityType: 'bond',
      };

      const { status } = await api.post({ facility: facilityWithInvalidDealId }).to('/v1/portal/facilities');

      expect(status).toEqual(404);
    });

    it('returns the created facility with correct fields', async () => {
      const { body, status } = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');

      expect(status).toEqual(200);

      expect(typeof body._id).toEqual('string');
      expect(body.facilityType).toEqual(newFacility.facilityType);
      expect(body.associatedDealId).toEqual(newFacility.associatedDealId);
      expect(typeof body.createdDate).toEqual('string');
    });

    it('creates incremental integer facility IDs', async () => {
      const facility1 = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facility2 = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facility3 = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');

      expect(parseInt(facility1.body._id).toString()).toEqual(facility1.body._id);
      expect(facility2.body._id - facility1.body._id).toEqual(1);
      expect(facility3.body._id - facility2.body._id).toEqual(1);
    });

    it('adds the facility id to the associated deal', async () => {
      const createdFacilityResponse = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');

      const createdFacility = createdFacilityResponse.body;

      const { status, body } = await api.get(`/v1/portal/deals/${newFacility.associatedDealId}`);

      expect(status).toEqual(200);
      expect(body.deal.facilities).toEqual([
        createdFacility._id,
      ]);
    });

    it('updates `editedBy` in the associated deal', async () => {
      const originalDeal = await api.get(`/v1/portal/deals/${newFacility.associatedDealId}`);

      expect(originalDeal.body.deal.editedBy).toEqual([]);

      const createdFacilityResponse = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');

      const { status, body } = await api.get(`/v1/portal/deals/${newFacility.associatedDealId}`);

      expect(status).toEqual(200);

      expect(body.deal.editedBy[0].userId).toEqual(mockUser._id);
      expect(body.deal.editedBy[0].bank).toEqual(mockUser.bank);
      expect(body.deal.editedBy[0].roles).toEqual(mockUser.roles);
      expect(body.deal.editedBy[0].username).toEqual(mockUser.username);
      expect(typeof body.deal.editedBy[0].date).toEqual('string');
    });

    describe('when required fields are missing', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          facilityType: '',
          associatedDealId: '',
        };

        const { body, status } = await api.post({ facility: postBody, user: mockUser }).to('/v1/portal/facilities');

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(2);

        expect(body.validationErrors.errorList.facilityType).toBeDefined();
        expect(body.validationErrors.errorList.facilityType.text).toEqual('Enter the Facility type');

        expect(body.validationErrors.errorList.associatedDealId).toBeDefined();
        expect(body.validationErrors.errorList.associatedDealId.text).toEqual('Enter the Associated deal id');
      });
    });

    describe('when required fields are invalid', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          facilityType: 'invalid-facility',
          associatedDealId: '123123456',
          user: {},
        };

        const { body, status } = await api.post({ facility: postBody, user: mockUser }).to('/v1/portal/facilities');

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);

        expect(body.validationErrors.errorList.facilityType).toBeDefined();
        expect(body.validationErrors.errorList.facilityType.text).toEqual('Facility type must be bond or loan');
      });
    });
  });

  describe('GET /v1/portal/facilities/:id', () => {
    it('returns the requested resource', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const newId = postResult.body._id;

      const { status, body } = await api.get(`/v1/portal/facilities/${newId}`);

      expect(status).toEqual(200);
      expect(body._id).toEqual(newId);
      expect(typeof body.createdDate).toEqual('string');
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await api.get('/v1/portal/facilities/12345678910');

      expect(status).toEqual(404);
    });
  });

  describe('PUT /v1/tfm/facilities/:id', () => {
    it('doesn\'t update `editedBy` in the associated deal', async () => {
      const originalDeal = await api.get(`/v1/portal/deals/${newFacility.associatedDealId}`);

      expect(originalDeal.body.deal.editedBy).toEqual([]);

      const createdFacilityResponse = await api.post({ facility: newFacility, user: mockUser }).to('/v1/tfm/facilities');

      const getDealResponse = await api.get(`/v1/portal/deals/${newFacility.associatedDealId}`);
      expect(getDealResponse.body.deal.editedBy.length).toEqual(0);

      const updatedFacility = {
        ...createdFacilityResponse.body,
        facilityValue: 123456,
        user: mockUser,
      };

      await api.put(updatedFacility).to(`/v1/tfm/facilities/${createdFacilityResponse.body._id}`);

      const { body } = await api.get(`/v1/portal/deals/${newFacility.associatedDealId}`);

      expect(body.deal.editedBy.length).toEqual(0);
    });
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
