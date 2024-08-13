const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { generateParsedMockAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { ObjectId } = require('mongodb');
const { withValidateAuditDetailsTests } = require('../../helpers/with-validate-audit-details.api-tests');
const wipeDB = require('../../wipeDB');
const { testApi } = require('../../test-api');
const { DEALS } = require('../../../src/constants');
const { MOCK_PORTAL_USER } = require('../../mocks/test-users/mock-portal-user');

describe('/v1/portal/gef/deals/:id', () => {
  // Update GEF deal
  describe('PUT /v1/portal/gef/deals/:id', () => {
    const newDeal = {
      dealType: DEALS.DEAL_TYPE.GEF,
      status: 'Draft',
    };

    const updatedDeal = {
      ...newDeal,
      dealType: 'GEF',
      additionalRefName: 'change this field',
      eligibility: {
        ...newDeal.eligibility,
        mockNewField: true,
      },
    };

    const auditDetails = generatePortalAuditDetails(new ObjectId());

    const anUpdateDealRequest = {
      dealUpdate: updatedDeal,
      user: MOCK_PORTAL_USER,
      auditDetails,
    };

    let dealId;
    beforeEach(async () => {
      await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
      ({
        body: { _id: dealId },
      } = await testApi.post(newDeal).to('/v1/portal/gef/deals'));
    });

    withValidateAuditDetailsTests({
      makeRequest: (auditDetailsToUse) => {
        return testApi.put({ dealUpdate: updatedDeal, auditDetails: auditDetailsToUse }).to(`/v1/portal/gef/deals/${dealId}`);
      },
    });

    it('should return audit record', async () => {
      const { status, body } = await testApi.put(anUpdateDealRequest).to(`/v1/portal/gef/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.auditRecord).toEqual(generateParsedMockAuditDatabaseRecord(auditDetails));
    });

    it('Returns 404 when the deal does not exist ', async () => {
      const invalidDealId = '123456789f0ffe00219319c1';
      const { status } = await testApi.put(anUpdateDealRequest).to(`/v1/portal/gef/deals/${invalidDealId}`);

      expect(status).toEqual(404);
    });

    it('Return and update the GEF deal', async () => {
      const { status, body } = await testApi.put(anUpdateDealRequest).to(`/v1/portal/gef/deals/${dealId}`);

      expect(status).toEqual(200);

      expect(body.additionalRefName).toEqual('change this field');
      expect(body.eligibility.mockNewField).toEqual(true);
    });
  });
});
