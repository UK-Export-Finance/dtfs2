const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const {
  MOCK_BSS_FACILITY, MOCK_BSS_DEAL, MOCK_USER, MOCK_DEAL_ID
} = require('../mocks/mock-data');
const CONSTANTS = require('../../../src/constants');

const createDeal = async () => {
  const { body } = await api.post({ deal: MOCK_BSS_DEAL, user: MOCK_USER }).to('/v1/portal/deals');
  return body;
};

describe('/v1/portal/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe(['deals', 'facilities']);
  });

  beforeEach(async () => {
    const deal = await createDeal();

    dealId = deal._id;
    MOCK_BSS_FACILITY.dealId = dealId;
  });

  describe('POST /v1/portal/facilities', () => {
    it('returns 404 when associatedDeal/dealId is not found', async () => {
      const facilityWithInvalidDealId = {
        dealId: MOCK_DEAL_ID,
        type: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
      };

      const { status } = await api.post({ facility: facilityWithInvalidDealId, user: MOCK_USER }).to('/v1/portal/facilities');

      expect(status).toEqual(404);
    });

    it('returns 404 when user is not found', async () => {
      const facilityWithInvalidDealId = {
        dealId: MOCK_DEAL_ID,
        type: CONSTANTS.FACILITIES.FACILITY_TYPE.BOND,
      };

      const { status } = await api.post({ facility: facilityWithInvalidDealId }).to('/v1/portal/facilities');

      expect(status).toEqual(404);
    });

    it('creates a facility with correct fields', async () => {
      const { body, status } = await api.post({ facility: MOCK_BSS_FACILITY, user: MOCK_USER }).to('/v1/portal/facilities');

      expect(status).toEqual(200);
      expect(body._id).toBeString();

      const { body: facilityAfterCreation } = await api.get(`/v1/portal/facilities/${body._id}`);

      expect(facilityAfterCreation.type).toEqual(MOCK_BSS_FACILITY.type);
      expect(facilityAfterCreation.dealId).toEqual(MOCK_BSS_FACILITY.dealId);
      expect(facilityAfterCreation.createdDate).toBeNumber();
      expect(facilityAfterCreation.updatedAt).toBeNumber();
    });

    it('adds the facility id to the associated deal', async () => {
      const createdFacilityResponse = await api.post({ facility: MOCK_BSS_FACILITY, user: MOCK_USER }).to('/v1/portal/facilities');
      expect(createdFacilityResponse.status).toEqual(200);

      const createdFacility = createdFacilityResponse.body;

      const { status, body } = await api.get(`/v1/portal/deals/${MOCK_BSS_FACILITY.dealId}`);

      expect(status).toEqual(200);
      expect(body.deal.facilities).toEqual([createdFacility._id]);
    });

    it('updates `editedBy` in the associated deal', async () => {
      const originalDeal = await api.get(`/v1/portal/deals/${MOCK_BSS_FACILITY.dealId}`);

      expect(originalDeal.body.deal.editedBy).toEqual([]);
      await api.post({ facility: MOCK_BSS_FACILITY, user: MOCK_USER }).to('/v1/portal/facilities');

      const { status, body } = await api.get(`/v1/portal/deals/${MOCK_BSS_FACILITY.dealId}`);

      expect(status).toEqual(200);

      expect(body.deal.editedBy[0].userId).toEqual(MOCK_USER._id);
      expect(body.deal.editedBy[0].bank).toEqual(MOCK_USER.bank);
      expect(body.deal.editedBy[0].roles).toEqual(MOCK_USER.roles);
      expect(body.deal.editedBy[0].username).toEqual(MOCK_USER.username);
      expect(body.deal.editedBy[0].date).toBeNumber();
    });

    describe('when required fields are missing', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          type: '',
          dealId: '',
        };

        const { body, status } = await api.post({ facility: postBody, user: MOCK_USER }).to('/v1/portal/facilities');

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
          dealId: MOCK_DEAL_ID,
          user: {},
        };

        const { body, status } = await api.post({ facility: postBody, user: MOCK_USER }).to('/v1/portal/facilities');

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);

        expect(body.validationErrors.errorList.type).toBeDefined();
        expect(body.validationErrors.errorList.type.text).toEqual('Facility type must be Bond or Loan');
      });
    });
  });
});
