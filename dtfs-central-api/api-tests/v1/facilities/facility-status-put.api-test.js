const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { generateParsedMockAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { ObjectId } = require('mongodb');
const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const { testApi } = require('../../test-api');
const aDeal = require('../deal-builder');
const { DEALS } = require('../../../src/constants');
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
  dealType: DEALS.DEAL_TYPE.BSS_EWCS,
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
    const { body: deal } = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });

    dealId = deal._id;
    newFacility.dealId = dealId;
  });

  describe('PUT /v1/portal/facilities/:id/status', () => {
    const updateAuditDetails = generatePortalAuditDetails(new ObjectId());

    const updateFacilityStatusBody = {
      status: 'Test new status',
      auditDetails: updateAuditDetails,
    };

    let facilityIdToUpdate;

    beforeEach(async () => {
      const mockSubmittedFacility = {
        ...newFacility,
        status: 'Submitted',
      };

      const originalDeal = await testApi.get(`/v1/portal/deals/${newFacility.dealId}`);

      expect(originalDeal.body.deal.editedBy).toEqual([]);

      ({
        body: { _id: facilityIdToUpdate },
      } = await createFacility({ facility: mockSubmittedFacility, user: MOCK_PORTAL_USER }));
    });

    withValidateAuditDetailsTests({
      makeRequest: async (auditDetailsToUse) => {
        return testApi.put({ status: 'Test new status', auditDetails: auditDetailsToUse }).to(`/v1/portal/facilities/${facilityIdToUpdate}/status`);
      },
    });

    it('changes facility status', async () => {
      await testApi.put(updateFacilityStatusBody).to(`/v1/portal/facilities/${facilityIdToUpdate}/status`);

      const { body } = await testApi.get(`/v1/portal/facilities/${facilityIdToUpdate}`);

      expect(body.status).toEqual(updateFacilityStatusBody.status);
    });

    it('updates audit record', async () => {
      await testApi.put(updateFacilityStatusBody).to(`/v1/portal/facilities/${facilityIdToUpdate}/status`);

      const { body } = await testApi.get(`/v1/portal/facilities/${facilityIdToUpdate}`);

      expect(body.auditRecord).toEqual(generateParsedMockAuditDatabaseRecord(updateAuditDetails));
    });

    it('does NOT update `editedBy` in the associated deal', async () => {
      const getDealResponse = await testApi.get(`/v1/portal/deals/${newFacility.dealId}`);

      // editedBy is updated once when `create facility` is called
      expect(getDealResponse.body.deal.editedBy.length).toEqual(1);

      await testApi.put(updateFacilityStatusBody).to(`/v1/tfm/facilities/${facilityIdToUpdate}/status`);

      const { body } = await testApi.get(`/v1/portal/deals/${newFacility.dealId}`);

      expect(body.deal.editedBy.length).toEqual(1);
    });

    it('returns 404 when facility does not exist', async () => {
      const { status } = await testApi.put(updateFacilityStatusBody).to('/v1/portal/facilities/61e54e2e532cf2027303e011/status');

      expect(status).toEqual(404);
    });
  });
});
