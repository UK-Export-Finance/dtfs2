const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const CONSTANTS = require('../../../src/constants');
const { MOCK_BSS_FACILITY, MOCK_BSS_DEAL, MOCK_USER } = require('../mocks/mock-data');

describe('/v1/portal/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe(['deals', 'facilities']);
  });

  beforeEach(async () => {
    const { body: deal } = await api.post({ deal: MOCK_BSS_DEAL, user: MOCK_USER }).to('/v1/portal/deals');

    dealId = deal._id;
    MOCK_BSS_FACILITY.dealId = dealId;
  });

  describe('PUT /v1/portal/facilities/:id', () => {
    it('returns 404 when adding facility to non-existent deal', async () => {
      await api.post({ facility: MOCK_BSS_FACILITY, user: MOCK_USER }).to('/v1/portal/facilities');
      const { status } = await api.put({ facility: MOCK_BSS_FACILITY, user: MOCK_USER }).to('/v1/portal/facilities/61e54e2e532cf2027303ea12');

      expect(status).toEqual(404);
    });

    it('returns the updated facility', async () => {
      const postResult = await api.post({ facility: MOCK_BSS_FACILITY, user: MOCK_USER }).to('/v1/portal/facilities');
      const createdFacility = postResult.body;

      const updatedFacility = {
        ...createdFacility,
        value: 123456,
        user: MOCK_USER,
      };

      const { body, status } = await api.put(updatedFacility).to(`/v1/portal/facilities/${createdFacility._id}`);

      expect(status).toEqual(200);
      expect(body.updatedAt).toBeNumber();
      expect(body.value).toEqual(updatedFacility.value);
    });

    it('updates the facility', async () => {
      const postResult = await api.post({ facility: MOCK_BSS_FACILITY, user: MOCK_USER }).to('/v1/portal/facilities');
      const createdFacility = postResult.body;

      const updatedFacility = {
        ...createdFacility,
        value: 123456,
        user: MOCK_USER,
      };

      await api.put(updatedFacility).to(`/v1/portal/facilities/${createdFacility._id}`);

      const { body } = await api.get(`/v1/portal/facilities/${createdFacility._id}`);

      expect(body.updatedAt).toBeNumber();
      expect(body.value).toEqual(updatedFacility.value);
    });

    it('updates `editedBy` in the associated deal', async () => {
      const originalDeal = await api.get(`/v1/portal/deals/${MOCK_BSS_FACILITY.dealId}`);

      expect(originalDeal.body.deal.editedBy).toEqual([]);

      const createdFacilityResponse = await api.post({ facility: MOCK_BSS_FACILITY, user: MOCK_USER }).to('/v1/portal/facilities');

      const getDealResponse = await api.get(`/v1/portal/deals/${MOCK_BSS_FACILITY.dealId}`);
      expect(getDealResponse.body.deal.editedBy.length).toEqual(1);

      const updatedFacility = {
        ...createdFacilityResponse.body,
        value: 123456,
        user: MOCK_USER,
      };

      await api.put(updatedFacility).to(`/v1/portal/facilities/${createdFacilityResponse.body._id}`);

      const { body } = await api.get(`/v1/portal/deals/${MOCK_BSS_FACILITY.dealId}`);

      expect(body.deal.editedBy[1].userId).toEqual(updatedFacility.user._id);
      expect(body.deal.editedBy[1].bank).toEqual(updatedFacility.user.bank);
      expect(body.deal.editedBy[1].roles).toEqual(updatedFacility.user.roles);
      expect(body.deal.editedBy[1].username).toEqual(updatedFacility.user.username);
      expect(body.deal.editedBy[1].date).toBeNumber();
    });

    it('updates the facility when no req.body.user is provided', async () => {
      const postResult = await api.post({ facility: MOCK_BSS_FACILITY, user: MOCK_USER }).to('/v1/portal/facilities');
      const createdFacility = postResult.body;

      const updatedFacility = {
        ...createdFacility,
        value: 123456,
      };

      await api.put(updatedFacility).to(`/v1/portal/facilities/${createdFacility._id}`);

      const { body } = await api.get(`/v1/portal/facilities/${createdFacility._id}`);

      expect(body.value).toEqual(updatedFacility.value);
    });
  });

  describe('PUT /v1/tfm/facilities/:id', () => {
    it('returns 404 when facility does not exist', async () => {
      const { status } = await api.put({}).to('/v1/tfm/facilities/61e54e2e532cf2027303e001');

      expect(status).toEqual(404);
    });
  });

  describe('PUT /v1/portal/facilities/:id/status', () => {
    const updateFacilityStatusBody = {
      status: 'Test new status',
    };

    it('changes facility status', async () => {
      const originalDeal = await api.get(`/v1/portal/deals/${MOCK_BSS_FACILITY.dealId}`);

      expect(originalDeal.body.deal.editedBy).toEqual([]);

      const mockSubmittedFacility = {
        ...MOCK_BSS_FACILITY,
        status: CONSTANTS.DEALS.DEAL_STATUS.SUBMITTED_TO_UKEF,
      };

      const createdFacilityResponse = await api.post({ facility: mockSubmittedFacility, user: MOCK_USER }).to('/v1/portal/facilities');

      await api.put(updateFacilityStatusBody).to(`/v1/portal/facilities/${createdFacilityResponse.body._id}/status`);

      const { body } = await api.get(`/v1/portal/facilities/${createdFacilityResponse.body._id}`);

      expect(body.status).toEqual(updateFacilityStatusBody.status);
    });

    it('does NOT update `editedBy` in the associated deal', async () => {
      const originalDeal = await api.get(`/v1/portal/deals/${MOCK_BSS_FACILITY.dealId}`);

      expect(originalDeal.body.deal.editedBy).toEqual([]);

      const createdFacilityResponse = await api.post({ facility: MOCK_BSS_FACILITY, user: MOCK_USER }).to('/v1/portal/facilities');

      const getDealResponse = await api.get(`/v1/portal/deals/${MOCK_BSS_FACILITY.dealId}`);

      // editedBy is updated once when `create facility` is called
      expect(getDealResponse.body.deal.editedBy.length).toEqual(1);

      await api.put(updateFacilityStatusBody).to(`/v1/tfm/facilities/${createdFacilityResponse.body._id}/status`);

      const { body } = await api.get(`/v1/portal/deals/${MOCK_BSS_FACILITY.dealId}`);

      expect(body.deal.editedBy.length).toEqual(1);
    });

    it('returns 404 when facility does not exist', async () => {
      const { status } = await api.put(updateFacilityStatusBody).to('/v1/portal/facilities/61e54e2e532cf2027303e011/status');

      expect(status).toEqual(404);
    });
  });
});
