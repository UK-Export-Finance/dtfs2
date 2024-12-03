const { generateParsedMockAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { ObjectId } = require('mongodb');
const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { withValidateAuditDetailsTests } = require('../../helpers/with-validate-audit-details.api-tests');
const wipeDB = require('../../wipeDB');
const { testApi } = require('../../test-api');
const { DEALS } = require('../../../src/constants');

describe('/v1/portal/gef/deals/:id/status', () => {
  describe('PUT /v1/portal/gef/deals/:id/status', () => {
    const mockDeal = {
      dealType: DEALS.DEAL_TYPE.GEF,
      status: 'Draft',
      updatedAt: 1234.0,
    };

    let createdDealId;
    const acknowledgedStatus = 'Acknowledged';
    const auditDetails = generatePortalAuditDetails(new ObjectId());
    const acknowledgedStatusUpdateRequest = {
      status: acknowledgedStatus,
      auditDetails,
    };

    beforeEach(async () => {
      await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
      ({
        body: { _id: createdDealId },
      } = await testApi.post(mockDeal).to(`/v1/portal/gef/deals`));
    });

    withValidateAuditDetailsTests({
      makeRequest: (auditDetailsToUse) =>
        testApi
          .put({
            status: acknowledgedStatus,
            auditDetails: auditDetailsToUse,
          })
          .to(`/v1/portal/gef/deals/${createdDealId}/status`),
    });

    it('should return audit record', async () => {
      const { status, body } = await testApi.put(acknowledgedStatusUpdateRequest).to(`/v1/portal/gef/deals/${createdDealId}/status`);
      expect(status).toEqual(200);
      expect(body.auditRecord).toEqual(generateParsedMockAuditDatabaseRecord(auditDetails));
    });

    it('updates a deal status and previousStatus', async () => {
      const { body, status } = await testApi.put(acknowledgedStatusUpdateRequest).to(`/v1/portal/gef/deals/${createdDealId}/status`);

      expect(status).toEqual(200);

      expect(body.status).toEqual(acknowledgedStatusUpdateRequest.status);
      expect(body.previousStatus).toEqual(mockDeal.status);
      expect(body.updatedAt).not.toEqual(mockDeal.updatedAt);
      expect(typeof body.updatedAt).toEqual('number');
    });

    it("returns 400 bad request status code when the new status is same as application's existing status", async () => {
      // First status update
      const { status } = await testApi.put(acknowledgedStatusUpdateRequest).to(`/v1/portal/gef/deals/${createdDealId}/status`);
      expect(status).toEqual(200);

      // Second status update
      const { status: secondStatus } = await testApi.put(acknowledgedStatusUpdateRequest).to(`/v1/portal/gef/deals/${createdDealId}/status`);
      expect(secondStatus).toEqual(400);
    });

    it('returns 404 when deal does not exist ', async () => {
      const invalidDealId = '123456789f0ffe00219319c1';
      const { status } = await testApi.put(acknowledgedStatusUpdateRequest).to(`/v1/portal/gef/deals/${invalidDealId}/status`);

      expect(status).toEqual(404);
    });
  });
});
