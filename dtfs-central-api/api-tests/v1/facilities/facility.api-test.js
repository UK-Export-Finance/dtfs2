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
  facilityType: 'Bond',
  dealId: '123123456',
};

const newDeal = aDeal({
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
});

const createDeal = async () => {
  const { body } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
  return body;
};

describe('/v1/portal/facilities', () => {
  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
    await wipeDB.wipe(['tfm-facilities']);
  });

  describe('POST /v1/portal/facilities', () => {
    it('returns 404 when associatedDeal/dealId is not found', async () => {
      const facilityWithInvalidDealId = {
        dealId: '1234',
        facilityType: 'Bond',
      };

      const { status } = await api.post({ facility: facilityWithInvalidDealId, user: mockUser }).to('/v1/portal/facilities');

      expect(status).toEqual(404);
    });

    it('returns 404 when user is not found', async () => {
      const facilityWithInvalidDealId = {
        dealId: '1234',
        facilityType: 'Bond',
      };

      const { status } = await api.post({ facility: facilityWithInvalidDealId }).to('/v1/portal/facilities');

      expect(status).toEqual(404);
    });

    it('creates a facility', async () => {
      const { _id } = await createDeal();
      newFacility.dealId = _id;

      const { body, status } = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');

      expect(status).toEqual(200);

      expect(typeof body._id).toEqual('string');

      const { body: facilityAfterCreation } = await api.get(`/v1/portal/facilities/${body._id}`);

      expect(facilityAfterCreation).toEqual({
        _id: body._id,
        ...newFacility,
        createdDate: expect.any(String),
      });
    });

    it('creates incremental integer facility IDs', async () => {
      const { _id } = await createDeal();
      newFacility.dealId = _id;

      const facility1 = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facility2 = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const facility3 = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');

      expect(facility1.body._id).toEqual(facility1.body._id);
      expect(facility2.body._id - facility1.body._id).toEqual(1);
      expect(facility3.body._id - facility2.body._id).toEqual(1);
    });

    it('adds the facility id to the associated deal', async () => {
      const { _id } = await createDeal();
      newFacility.dealId = _id;

      const {
        status: createdFacilityStatus,
        body: createdFacility,
      } = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');

      expect(createdFacilityStatus).toEqual(200);

      const { status, body } = await api.get(`/v1/portal/deals/${newFacility.dealId}`);

      expect(status).toEqual(200);

      if (createdFacility) {
        expect(body.deal.facilities).toEqual([
          createdFacility._id,
        ]);
      }
    });

    describe('when required fields are missing', () => {
      it('returns 400 with validation errors', async () => {
        const { _id } = await createDeal();
        newFacility.dealId = _id;

        const postBody = {
          facilityType: '',
          dealId: '',
        };

        const { body, status } = await api.post({ facility: postBody, user: mockUser }).to('/v1/portal/facilities');

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(2);

        expect(body.validationErrors.errorList.facilityType).toBeDefined();
        expect(body.validationErrors.errorList.facilityType.text).toEqual('Enter the Facility type');

        expect(body.validationErrors.errorList.dealId).toBeDefined();
        expect(body.validationErrors.errorList.dealId.text).toEqual('Enter the Associated deal id');
      });
    });

    describe('when required fields are invalid', () => {
      it('returns 400 with validation errors', async () => {
        const { _id } = await createDeal();
        newFacility.dealId = _id;

        const postBody = {
          facilityType: 'invalid-facility',
          dealId: '123123456',
          user: {},
        };

        const { body, status } = await api.post({ facility: postBody, user: mockUser }).to('/v1/portal/facilities');

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);

        expect(body.validationErrors.errorList.facilityType).toBeDefined();
        expect(body.validationErrors.errorList.facilityType.text).toEqual('Facility type must be Bond or Loan');
      });
    });
  });

  describe('GET /v1/portal/facilities/:id', () => {
    it('returns the requested resource', async () => {
      const { _id } = await createDeal();
      newFacility.dealId = _id;

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
      const { _id } = await createDeal();
      newFacility.dealId = _id;

      const originalDeal = await api.get(`/v1/portal/deals/${newFacility.dealId}`);

      expect(originalDeal.body.deal.editedBy).toEqual([]);

      const createdFacilityResponse = await api.post({ facility: newFacility, user: mockUser }).to('/v1/tfm/facilities');

      const getDealResponse = await api.get(`/v1/portal/deals/${newFacility.dealId}`);
      expect(getDealResponse.body.deal.editedBy.length).toEqual(0);

      const updatedFacility = {
        ...createdFacilityResponse.body,
        value: 123456,
        user: mockUser,
      };

      await api.put(updatedFacility).to(`/v1/tfm/facilities/${createdFacilityResponse.body._id}`);

      const { body } = await api.get(`/v1/portal/deals/${newFacility.dealId}`);

      expect(body.deal.editedBy.length).toEqual(0);
    });
  });
});
