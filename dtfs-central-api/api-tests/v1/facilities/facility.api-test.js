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
  user: mockUser,
};

const newDeal = aDeal({
  details: {
    bankSupplyContractName: 'mock name',
    bankSupplyContractID: 'mock id',
    maker: mockUser,
  },
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  }
});

const createDeal = async () => {
  const { body, status } = await api.post(newDeal).to('/v1/deals');
  return body;
}

describe('/v1/facilities', () => {
  let dealId;

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);

    const deal = await createDeal();

    dealId = deal._id;
    newFacility.associatedDealId = dealId;
  });

  describe('POST /v1/facilities', () => {
    it('returns 404 when associatedDeal/associatedDealId is not found', async () => {
      newFacility.associatedDealId = '1234';
      const { body, status } = await api.post(newFacility).to('/v1/facilities');

      expect(status).toEqual(404);
    });

    it('returns the created facility with correct fields', async () => {
      const { body, status } = await api.post(newFacility).to('/v1/facilities');

      expect(status).toEqual(200);

      expect(typeof body._id).toEqual('string');
      expect(body.facilityType).toEqual(newFacility.facilityType);
      expect(body.associatedDealId).toEqual(newFacility.associatedDealId);
      expect(typeof body.createdDate).toEqual('string');
    });

    it('creates incremental integer facility IDs', async () => {
      const facility1 = await api.post(newFacility).to('/v1/facilities');
      const facility2 = await api.post(newFacility).to('/v1/facilities');
      const facility3 = await api.post(newFacility).to('/v1/facilities');

      expect(parseInt(facility1.body._id).toString()).toEqual(facility1.body._id);
      expect(facility2.body._id - facility1.body._id).toEqual(1);
      expect(facility3.body._id - facility2.body._id).toEqual(1);
    });

    it('adds the facility id to the associated deal', async () => {
      const createdFacilityResponse = await api.post(newFacility).to('/v1/facilities');

      const createdFacility = createdFacilityResponse.body;

      const { status, body } = await api.get(`/v1/deals/${newFacility.associatedDealId}`);

      expect(status).toEqual(200);
      expect(body.deal.facilities).toEqual([
        createdFacility._id,
      ]);
    });

    it('updates `editedBy` in the associated deal', async () => {
      const originalDeal = await api.get(`/v1/deals/${newFacility.associatedDealId}`);

      expect(originalDeal.body.deal.editedBy).toEqual([]);

      const createdFacilityResponse = await api.post(newFacility).to('/v1/facilities');

      const { status, body } = await api.get(`/v1/deals/${newFacility.associatedDealId}`);

      expect(status).toEqual(200);

      expect(body.deal.editedBy[0].userId).toEqual(newFacility.user._id);
      expect(body.deal.editedBy[0].bank).toEqual(newFacility.user.bank);
      expect(body.deal.editedBy[0].roles).toEqual(newFacility.user.roles);
      expect(body.deal.editedBy[0].username).toEqual(newFacility.user.username);
      expect(typeof body.deal.editedBy[0].date).toEqual('string');
    });

    describe('when required fields are missing', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          facilityType: '',
          associatedDealId: '',
        };

        const { body, status } = await api.post(postBody).to('/v1/facilities');

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(3);

        expect(body.validationErrors.errorList.facilityType).toBeDefined();
        expect(body.validationErrors.errorList.facilityType.text).toEqual('Enter the Facility type');

        expect(body.validationErrors.errorList.associatedDealId).toBeDefined();
        expect(body.validationErrors.errorList.associatedDealId.text).toEqual('Enter the Associated deal id');

        expect(body.validationErrors.errorList.userObject).toBeDefined();
        expect(body.validationErrors.errorList.userObject.text).toEqual('User object with _id, roles and bank is required');
      });
    });

    describe('when required fields are invalid', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          facilityType: 'invalid-facility',
          associatedDealId: '123123456',
          user: {}
        };

        const { body, status } = await api.post(postBody).to('/v1/facilities');

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(2);

        expect(body.validationErrors.errorList.facilityType).toBeDefined();
        expect(body.validationErrors.errorList.facilityType.text).toEqual('Facility type must be bond or loan');

        expect(body.validationErrors.errorList.userObject).toBeDefined();
        expect(body.validationErrors.errorList.userObject.text).toEqual('User object with _id, roles and bank is required');
      });
    });
  });

  describe('GET /v1/facilities/:id', () => {
    it('returns the requested resource', async () => {
      const postResult = await api.post(newFacility).to('/v1/facilities');
      const newId = postResult.body._id;

      const { status, body } = await api.get(`/v1/facilities/${newId}`);

      expect(status).toEqual(200);
      expect(body._id).toEqual(newId);
      expect(typeof body.createdDate).toEqual('string');
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await api.get('/v1/facilities/12345678910');

      expect(status).toEqual(404);
    });
  });

  describe('PUT /v1/facilities/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.put({}).to('/v1/facilities/123456789012');

      expect(status).toEqual(404);
    });

    it('returns the updated facility', async () => {
      const postResult = await api.post(newFacility).to('/v1/facilities');
      const createdFacility = postResult.body;

      const updatedFacility = {
        ...createdFacility,
        facilityValue: 123456,
        user: mockUser,
      };

      const { body, status } = await api.put(updatedFacility).to(`/v1/facilities/${createdFacility._id}`);

      expect(status).toEqual(200);
      expect(typeof body.lastEdited).toEqual('string');
      expect(body.facilityValue).toEqual(updatedFacility.facilityValue);
    });

    it('updates the facility', async () => {
      const postResult = await api.post(newFacility).to('/v1/facilities');
      const createdFacility = postResult.body;

      const updatedFacility = {
        ...createdFacility,
        facilityValue: 123456,
        user: mockUser,
      };

      await api.put(updatedFacility).to(`/v1/facilities/${createdFacility._id}`);

      const { body } = await api.get(`/v1/facilities/${createdFacility._id}`);

      expect(typeof body.lastEdited).toEqual('string');
      expect(body.facilityValue).toEqual(updatedFacility.facilityValue);
    });

    it('updates `editedBy` in the associated deal', async () => {
      const originalDeal = await api.get(`/v1/deals/${newFacility.associatedDealId}`);

      expect(originalDeal.body.deal.editedBy).toEqual([]);

      const createdFacilityResponse = await api.post(newFacility).to('/v1/facilities');

      const getDealResponse = await api.get(`/v1/deals/${newFacility.associatedDealId}`);
      expect(getDealResponse.body.deal.editedBy.length).toEqual(1);

      const updatedFacility = {
        ...createdFacilityResponse.body,
        facilityValue: 123456,
        user: mockUser,
      };

      await api.put(updatedFacility).to(`/v1/facilities/${createdFacilityResponse.body._id}`);

      const { body } = await api.get(`/v1/deals/${newFacility.associatedDealId}`);


      expect(body.deal.editedBy[1].userId).toEqual(updatedFacility.user._id);
      expect(body.deal.editedBy[1].bank).toEqual(updatedFacility.user.bank);
      expect(body.deal.editedBy[1].roles).toEqual(updatedFacility.user.roles);
      expect(body.deal.editedBy[1].username).toEqual(updatedFacility.user.username);
      expect(typeof body.deal.editedBy[1].date).toEqual('string');
    });
  });

  describe('DELETE /v1/facilities/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.remove({}).to('/v1/facilities/12345678910');

      expect(status).toEqual(404);
    });

    it('deletes the facility', async () => {
      const { body } = await api.post(newFacility).to('/v1/facilities');

      const {
        associatedDealId,
        _id: facilityId,
      } = body;

      const removeBody = {
        associatedDealId,
        user: mockUser,
      };

      const deleteResponse = await api.remove(removeBody).to(`/v1/facilities/${body._id}`);
      expect(deleteResponse.status).toEqual(200);

      const { status } = await api.get(`/v1/facilities/${body._id}`);

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

      const createdBond = await api.post(mockBond).to('/v1/facilities');
      const createdLoan = await api.post(mockBond).to('/v1/facilities');

      // make sure we've got facilities added to the deal
      const getDealResponse = await api.get(`/v1/deals/${newFacility.associatedDealId}`);
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

      const deleteResponse = await api.remove(removeBondBody).to(`/v1/facilities/${facilityId}`);
      expect(deleteResponse.status).toEqual(200);

      // check the deal's facilities array
      const { body: getDealBody } = await api.get(`/v1/deals/${newFacility.associatedDealId}`);
      expect(getDealBody.deal.facilities.length).toEqual(1);
      expect(getDealBody.deal.facilities[0]).toEqual(createdLoan.body._id);
    });
  });
});
