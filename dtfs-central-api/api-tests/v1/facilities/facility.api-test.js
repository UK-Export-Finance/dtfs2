const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const aDeal = require('../deal-builder');
const { MOCK_DEAL } = require('../mocks/mock-data');
const { MOCK_PORTAL_USER } = require('../../mocks/test-users/mock-portal-user');
const { createDeal } = require('../../helpers/create-deal');
const { createFacility } = require('../../helpers/create-facility');

const newFacility = {
  type: 'Bond',
  dealId: MOCK_DEAL.DEAL_ID,
};

const newDeal = aDeal({
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
  dealType: 'GEF',
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
});

describe('/v1/portal/facilities', () => {
  beforeEach(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
  });

  describe('POST /v1/portal/facilities', () => {
    it('returns 404 when associatedDeal/dealId is not found', async () => {
      const facilityWithInvalidDealId = {
        dealId: MOCK_DEAL.DEAL_ID,
        type: 'Bond',
      };

      const { status } = await createFacility({ api, facility: facilityWithInvalidDealId, user: MOCK_PORTAL_USER });

      expect(status).toEqual(404);
    });

    it('returns 404 when user is not found', async () => {
      const facilityWithInvalidDealId = {
        dealId: MOCK_DEAL.DEAL_ID,
        type: 'Bond',
      };

      const { status } = await await api.post({ facility: facilityWithInvalidDealId }).to('/v1/portal/facilities');

      expect(status).toEqual(404);
    });

    it('creates a facility', async () => {
      const {
        body: { _id },
      } = await createDeal({ api, deal: newDeal, user: MOCK_PORTAL_USER });
      newFacility.dealId = _id;

      const { body, status } = await createFacility({ api, facility: newFacility, user: MOCK_PORTAL_USER });

      expect(status).toEqual(200);

      expect(typeof body._id).toEqual('string');

      const { body: facilityAfterCreation } = await api.get(`/v1/portal/facilities/${body._id}`);

      expect(facilityAfterCreation).toEqual({
        _id: body._id,
        ...newFacility,
        createdDate: expect.any(Number),
        updatedAt: expect.any(Number),
      });
    });

    it('creates incremental integer facility IDs', async () => {
      const {
        body: { _id },
      } = await createDeal({ api, deal: newDeal, user: MOCK_PORTAL_USER });
      newFacility.dealId = _id;

      const facility1 = await createFacility({ api, facility: newFacility, user: MOCK_PORTAL_USER });
      const facility2 = await createFacility({ api, facility: newFacility, user: MOCK_PORTAL_USER });
      const facility3 = await createFacility({ api, facility: newFacility, user: MOCK_PORTAL_USER });

      expect(typeof facility1.body._id).toEqual('string');
      expect(typeof facility2.body._id).toEqual('string');
      expect(typeof facility3.body._id).toEqual('string');
    });

    it('adds the facility id to the associated deal', async () => {
      const {
        body: { _id },
      } = await createDeal({ api, deal: newDeal, user: MOCK_PORTAL_USER });
      newFacility.dealId = _id;

      const { status: createdFacilityStatus, body: createdFacility } = await createFacility({ api, facility: newFacility, user: MOCK_PORTAL_USER });

      expect(createdFacilityStatus).toEqual(200);

      const { status, body } = await api.get(`/v1/portal/deals/${newFacility.dealId}`);

      expect(status).toEqual(200);

      if (createdFacility) {
        expect(body.deal.facilities).toEqual([createdFacility._id]);
      }
    });

    describe('when required fields are missing', () => {
      it('returns 400 with validation errors', async () => {
        const {
          body: { _id },
        } = await createDeal({ api, deal: newDeal, user: MOCK_PORTAL_USER });

        newFacility.dealId = _id;

        const postBody = {
          type: '',
          dealId: '',
        };

        const { body, status } = await createFacility({ api, facility: postBody, user: MOCK_PORTAL_USER });

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(2);

        expect(body.validationErrors.errorList.type).toBeDefined();
        expect(body.validationErrors.errorList.type.text).toEqual('Enter the Facility type');

        expect(body.validationErrors.errorList.dealId).toBeDefined();
        expect(body.validationErrors.errorList.dealId.text).toEqual('Enter the Associated deal id');
      });
    });

    describe('when required fields are invalid', () => {
      it('returns 400 with validation errors', async () => {
        const {
          body: { _id },
        } = await createDeal({ api, deal: newDeal, user: MOCK_PORTAL_USER });

        newFacility.dealId = _id;

        const postBody = {
          type: 'invalid-facility',
          dealId: MOCK_DEAL.DEAL_ID,
          user: {},
        };

        const { body, status } = await createFacility({ api, facility: postBody, user: MOCK_PORTAL_USER });

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);

        expect(body.validationErrors.errorList.type).toBeDefined();
        expect(body.validationErrors.errorList.type.text).toEqual('Facility type must be Bond or Loan');
      });
    });
  });

  describe('GET /v1/portal/facilities/:id', () => {
    it('returns the requested resource', async () => {
      const {
        body: { _id },
      } = await createDeal({ api, deal: newDeal, user: MOCK_PORTAL_USER });
      newFacility.dealId = _id;

      const postResult = await createFacility({ api, facility: newFacility, user: MOCK_PORTAL_USER });
      const newId = postResult.body._id;

      const { status, body } = await api.get(`/v1/portal/facilities/${newId}`);

      expect(status).toEqual(200);
      expect(body._id).toEqual(newId);
      expect(typeof body.createdDate).toEqual('number');
    });
  });
});
