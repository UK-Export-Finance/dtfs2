const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const aDeal = require('../deal-builder');
const { MOCK_DEAL } = require('../mocks/mock-data');

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
  type: 'Bond',
  dealId: MOCK_DEAL.DEAL_ID,
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
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
  });

  beforeEach(async () => {
    const deal = await createDeal();

    dealId = deal._id;
    newFacility.dealId = dealId;
  });

  describe('POST /v1/portal/facilities', () => {
    it('returns 404 when associatedDeal/dealId is not found', async () => {
      const facilityWithInvalidDealId = {
        dealId: MOCK_DEAL.DEAL_ID,
        type: 'Bond',
      };

      const { status } = await api.post({ facility: facilityWithInvalidDealId, user: mockUser }).to('/v1/portal/facilities');

      expect(status).toEqual(404);
    });

    it('returns 404 when user is not found', async () => {
      const facilityWithInvalidDealId = {
        dealId: MOCK_DEAL.DEAL_ID,
        type: 'Bond',
      };

      const { status } = await api.post({ facility: facilityWithInvalidDealId }).to('/v1/portal/facilities');

      expect(status).toEqual(404);
    });

    it('creates a facility with correct fields', async () => {
      const { body, status } = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');

      expect(status).toEqual(200);
      expect(typeof body._id).toEqual('string');

      const { body: facilityAfterCreation } = await api.get(`/v1/portal/facilities/${body._id}`);

      expect(facilityAfterCreation.type).toEqual(newFacility.type);
      expect(facilityAfterCreation.dealId).toEqual(newFacility.dealId);
      expect(typeof facilityAfterCreation.createdDate).toEqual('number');
      expect(typeof facilityAfterCreation.updatedAt).toEqual('number');
    });

    it('adds the facility id to the associated deal', async () => {
      const createdFacilityResponse = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      expect(createdFacilityResponse.status).toEqual(200);

      const createdFacility = createdFacilityResponse.body;

      const { status, body } = await api.get(`/v1/portal/deals/${newFacility.dealId}`);

      expect(status).toEqual(200);
      expect(body.deal.facilities).toEqual([
        createdFacility._id,
      ]);
    });

    it('updates `editedBy` in the associated deal', async () => {
      const originalDeal = await api.get(`/v1/portal/deals/${newFacility.dealId}`);

      expect(originalDeal.body.deal.editedBy).toEqual([]);
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');

      const { status, body } = await api.get(`/v1/portal/deals/${newFacility.dealId}`);

      expect(status).toEqual(200);

      expect(body.deal.editedBy[0].userId).toEqual(mockUser._id);
      expect(body.deal.editedBy[0].bank).toEqual(mockUser.bank);
      expect(body.deal.editedBy[0].roles).toEqual(mockUser.roles);
      expect(body.deal.editedBy[0].username).toEqual(mockUser.username);
      expect(typeof body.deal.editedBy[0].date).toEqual('number');
    });

    describe('when required fields are missing', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          type: '',
          dealId: '',
        };

        const { body, status } = await api.post({ facility: postBody, user: mockUser }).to('/v1/portal/facilities');

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
        const postBody = {
          type: 'invalid-facility',
          dealId: MOCK_DEAL.DEAL_ID,
          user: {},
        };

        const { body, status } = await api.post({ facility: postBody, user: mockUser }).to('/v1/portal/facilities');

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);

        expect(body.validationErrors.errorList.type).toBeDefined();
        expect(body.validationErrors.errorList.type.text).toEqual('Facility type must be Bond or Loan');
      });
    });
  });
});
