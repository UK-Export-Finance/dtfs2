const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { generateParsedMockAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { ObjectId } = require('mongodb');
const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const aDeal = require('../deal-builder');
const CONSTANTS = require('../../../src/constants');
const { MOCK_DEAL } = require('../mocks/mock-data');
const { MOCK_PORTAL_USER } = require('../../mocks/test-users/mock-portal-user');
const { createDeal } = require('../../helpers/create-deal');
const { createFacility } = require('../../helpers/create-facility');
const { withValidateAuditDetailsTests } = require('../../helpers/with-validate-audit-details.api-tests');

const newFacility = {
  type: 'Bond',
  dealId: MOCK_DEAL.DEAL_ID,
};

const newDeal = aDeal({
  dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
});

describe('/v1/portal/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
  });

  beforeEach(async () => {
    const { body: deal } = await createDeal({ api, deal: newDeal, user: MOCK_PORTAL_USER });

    dealId = deal._id;
    newFacility.dealId = dealId;
  });

  describe('PUT /v1/portal/facilities/:id', () => {
    let createdFacility;
    let aValidUpdateRequest;
    const auditDetails = generatePortalAuditDetails(MOCK_PORTAL_USER._id);
    const expectedAuditRecord = generateParsedMockAuditDatabaseRecord(auditDetails);

    beforeEach(async () => {
      ({ body: createdFacility } = await createFacility({ api, facility: newFacility, user: MOCK_PORTAL_USER }));
      aValidUpdateRequest = {
        facilityUpdate: { ...createdFacility, value: 123456 },
        user: MOCK_PORTAL_USER,
        auditDetails,
      };
    });

    withValidateAuditDetailsTests({
      makeRequest: async (auditDetailsToUse) => {
        const facilityUpdate = {
          facilityUpdate: { ...createdFacility },
          user: MOCK_PORTAL_USER,
          auditDetails: auditDetailsToUse,
        };

        return api.put({ user: MOCK_PORTAL_USER, facilityUpdate, auditDetails }).to(`/v1/portal/facilities/${createdFacility._id}`);
      },
    });

    it('saves audit record to the facility', async () => {
      const { body, status } = await api.put(aValidUpdateRequest).to(`/v1/portal/facilities/${createdFacility._id}`);

      expect(status).toEqual(200);
      expect(body.auditRecord).toEqual(expectedAuditRecord);
    });

    it('returns 404 when adding facility to non-existent deal', async () => {
      const aValidButIncorrectDealId = new ObjectId();
      const { status } = await api.put(aValidUpdateRequest).to(`/v1/portal/facilities/${aValidButIncorrectDealId}`);

      expect(status).toEqual(404);
    });

    it('returns the updated facility', async () => {
      const { body, status } = await api.put(aValidUpdateRequest).to(`/v1/portal/facilities/${createdFacility._id}`);

      expect(status).toEqual(200);
      expect(typeof body.updatedAt).toEqual('number');
      expect(body.value).toEqual(aValidUpdateRequest.facilityUpdate.value);
    });

    it('updates the facility', async () => {
      await api.put(aValidUpdateRequest).to(`/v1/portal/facilities/${createdFacility._id}`);

      const { body } = await api.get(`/v1/portal/facilities/${createdFacility._id}`);

      expect(typeof body.updatedAt).toEqual('number');
      expect(body.value).toEqual(aValidUpdateRequest.facilityUpdate.value);
    });

    it('updates `editedBy` in the associated deal', async () => {
      const getDealResponse = await api.get(`/v1/portal/deals/${newFacility.dealId}`);
      expect(getDealResponse.body.deal.editedBy.length).toEqual(1);

      await api.put(aValidUpdateRequest).to(`/v1/portal/facilities/${createdFacility._id}`);

      const { body } = await api.get(`/v1/portal/deals/${newFacility.dealId}`);
      expect(body.deal.editedBy.length).toEqual(2);
      expect(body.deal.editedBy[1].userId).toEqual(aValidUpdateRequest.user._id);
      expect(body.deal.editedBy[1].bank).toEqual(aValidUpdateRequest.user.bank);
      expect(body.deal.editedBy[1].roles).toEqual(aValidUpdateRequest.user.roles);
      expect(body.deal.editedBy[1].username).toEqual(aValidUpdateRequest.user.username);
      expect(typeof body.deal.editedBy[1].date).toEqual('number');
    });

    it('updates the facility when no req.body.user is provided', async () => {
      const updatedFacility = {
        facilityUpdate: { ...createdFacility, value: 123456 },
        auditDetails,
      };

      await api.put(updatedFacility).to(`/v1/portal/facilities/${createdFacility._id}`);

      const { body } = await api.get(`/v1/portal/facilities/${createdFacility._id}`);

      expect(body.value).toEqual(updatedFacility.facilityUpdate.value);
    });
  });

  describe('PUT /v1/portal/facilities/:id/status', () => {
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
      const originalDeal = await api.get(`/v1/portal/deals/${newFacility.dealId}`);

      expect(originalDeal.body.deal.editedBy).toEqual([]);

      const mockSubmittedFacility = {
        ...newFacility,
        status: 'Submitted',
      };

      const createdFacilityResponse = await createFacility({ api, facility: mockSubmittedFacility, user: MOCK_PORTAL_USER });

      await api.put(updateFacilityStatusBody).to(`/v1/portal/facilities/${createdFacilityResponse.body._id}/status`);

      const { body } = await api.get(`/v1/portal/facilities/${createdFacilityResponse.body._id}`);

      expect(body.status).toEqual(updateFacilityStatusBody.status);
    });

    it('does NOT update `editedBy` in the associated deal', async () => {
      const originalDeal = await api.get(`/v1/portal/deals/${newFacility.dealId}`);

      expect(originalDeal.body.deal.editedBy).toEqual([]);

      const createdFacilityResponse = await createFacility({ api, facility: newFacility, user: MOCK_PORTAL_USER });

      const getDealResponse = await api.get(`/v1/portal/deals/${newFacility.dealId}`);

      // editedBy is updated once when `create facility` is called
      expect(getDealResponse.body.deal.editedBy.length).toEqual(1);

      await api.put(updateFacilityStatusBody).to(`/v1/tfm/facilities/${createdFacilityResponse.body._id}/status`);

      const { body } = await api.get(`/v1/portal/deals/${newFacility.dealId}`);

      expect(body.deal.editedBy.length).toEqual(1);
    });

    it('returns 404 when facility does not exist', async () => {
      const { status } = await api.put(updateFacilityStatusBody).to('/v1/portal/facilities/61e54e2e532cf2027303e011/status');

      expect(status).toEqual(404);
    });
  });
});
