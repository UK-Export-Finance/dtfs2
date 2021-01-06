const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const api = require('../../api')(app);
const aDeal = require('../deal-builder');

const newFacility = {
  facilityType: 'bond',
  associatedDealId: '123123456',
};

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

    it('returns 404 when associatedDealId is not found', async () => {
      newFacility.associatedDealId = '1234';
      const { body, status } = await api.post(newFacility).to('/v1/facilities');

      expect(status).toEqual(404);
    });

    describe('when required fields are missing', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          facilityType: '',
          associatedDealId: '',
        };

        const { body, status } = await api.post(postBody).to('/v1/facilities');

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
          associatedDealId: '123123456'
        };

        const { body, status } = await api.post(postBody).to('/v1/facilities');

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);

        expect(body.validationErrors.errorList.facilityType).toBeDefined();
        expect(body.validationErrors.errorList.facilityType.text).toEqual('Facility type must be bond or loan');
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
      };

      await api.put(updatedFacility).to(`/v1/facilities/${createdFacility._id}`);

      const { body } = await api.get(`/v1/facilities/${createdFacility._id}`);

      expect(typeof body.lastEdited).toEqual('string');
      expect(body.facilityValue).toEqual(updatedFacility.facilityValue);
    });
  });

  describe('DELETE /v1/facilities/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.remove('/v1/facilities/12345678910');

      expect(status).toEqual(404);
    });

    it('deletes the facility', async () => {
      const { body } = await api.post(newFacility).to('/v1/facilities');

      const deleteResponse = await api.remove(`/v1/facilities/${body._id}`);
      expect(deleteResponse.status).toEqual(200);

      const { status } = await api.get(`/v1/facilities/${body._id}`);

      expect(status).toEqual(404);
    });
  });
});
