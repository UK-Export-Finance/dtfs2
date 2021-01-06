const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const api = require('../../api')(app);

const newFacility = {
  facilityType: 'bond',
};

describe('/v1/facilities', () => {
  beforeEach(async () => {
    await wipeDB.wipe(['facilities']);
  });

  describe('POST /v1/facilities', () => {
    it('returns the created facility with correct fields', async () => {
      const { body, status } = await api.post(newFacility).to('/v1/facilities');

      expect(status).toEqual(200);

      expect(typeof body._id).toEqual('string');
      expect(body.facilityType).toEqual(newFacility.facilityType);
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

    describe('when required fields are missing', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          facilityType: '',
        };

        const { body, status } = await api.post(postBody).to('/v1/facilities');

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);

        expect(body.validationErrors.errorList.facilityType).toBeDefined();
        expect(body.validationErrors.errorList.facilityType.text).toEqual('Enter the Facility type');
      });
    });

    describe('when required fields are invalid', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          facilityType: 'invalid-facility',
        };

        const { body, status } = await api.post(postBody).to('/v1/facilities');

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);

        expect(body.validationErrors.errorList.facilityType).toBeDefined();
        expect(body.validationErrors.errorList.facilityType.text).toEqual('Facility type must be bond or loan');
      });
    });
  });

  // describe('GET /v1/facilities/:id', () => {
  //   it('returns the requested resource', async () => {
  //     const postResult = await api.post(newFacility).to('/v1/facilities');
  //     const newId = postResult.body._id;

  //     const { status, body } = await api.get(`/v1/facilities/${newId}`);

  //     expect(status).toEqual(200);
  //     expect(body.deal).toEqual(expectAddedFields(newFacility));
  //   });

  //   it('404s requests for unknown ids', async () => {
  //     const { status } = await api.get('/v1/facilities/12345678910');

  //     expect(status).toEqual(404);
  //   });
  // });

  describe('PUT /v1/facilities/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.put(updatedFacility).to('/v1/facilities/123456789012');

      expect(status).toEqual(404);
    });

    it('returns the updated facility', async () => {
      const postResult = await api.post(newFacility).to('/v1/facilities');
      const createdFacility = postResult.body;
      const updatedFacility = {
        ...createdFacility,
        facilityValue: 123456,
      };

      const { status, body } = await api.put(updatedFacility).to(`/v1/facilities/${createdFacility._id}`);

      expect(status).toEqual(200);

      // expect(body).toEqual(expectAddedFieldsWithEditedBy(updatedFacility, mockUser));
    });
  });
});
