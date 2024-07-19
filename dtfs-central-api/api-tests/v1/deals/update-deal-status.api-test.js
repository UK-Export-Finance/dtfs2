const { generateParsedMockAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { ObjectId } = require('mongodb');
const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deal-builder');

const { testApi } = require('../../test-api');
const { DEALS } = require('../../../src/constants');
const { MOCK_PORTAL_USER } = require('../../mocks/test-users/mock-portal-user');
const { createDeal } = require('../../helpers/create-deal');
const { withValidateAuditDetailsTests } = require('../../helpers/with-validate-audit-details.api-tests');

const newDeal = aDeal({
  dealType: DEALS.DEAL_TYPE.BSS_EWCS,
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
  status: DEALS.DEAL_STATUS.DRAFT,
  exporter: {
    companyName: 'mock company',
  },
  bankInternalRefName: 'test',
  submissionType: DEALS.SUBMISSION_TYPE.AIN,
  updatedAt: 123456789,
});

describe('/v1/portal/deals', () => {
  let createdDeal;
  const acknowledgedStatus = 'Acknowledged';
  const submittedStatus = 'Submitted';
  const auditDetails = generatePortalAuditDetails(new ObjectId());

  beforeEach(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
    const dealWithSubmittedStatus = {
      ...newDeal,
      status: submittedStatus,
    };

    ({ body: createdDeal } = await createDeal({ deal: dealWithSubmittedStatus, user: MOCK_PORTAL_USER }));
  });

  describe('PUT /v1/portal/deals/:id/status', () => {
    withValidateAuditDetailsTests({
      makeRequest: (auditDetailsToUse) => {
        return testApi.put({ status: acknowledgedStatus, auditDetails: auditDetailsToUse }).to(`/v1/portal/deals/${createdDeal._id}/status`);
      },
    });

    it('should return audit record', async () => {
      const { status, body } = await testApi.put({ status: acknowledgedStatus, auditDetails }).to(`/v1/portal/deals/${createdDeal._id}/status`);

      expect(status).toEqual(200);
      expect(body.auditRecord).toEqual(generateParsedMockAuditDatabaseRecord(auditDetails));
    });

    it('Should return 400 bad request status code when the new status is same and existing application status', async () => {
      // First status update - 200
      let statusUpdate = acknowledgedStatus;
      const { status } = await testApi.put({ status: statusUpdate, auditDetails }).to(`/v1/portal/deals/${createdDeal._id}/status`);
      expect(status).toEqual(200);

      // Second status update - 400
      statusUpdate = acknowledgedStatus;
      const { status: secondStatus } = await testApi.put({ status: statusUpdate, auditDetails }).to(`/v1/portal/deals/${createdDeal._id}/status`);
      expect(secondStatus).toEqual(400);
    });

    it('returns the updated deal with updated statuses', async () => {
      const { status, body } = await testApi.put({ status: acknowledgedStatus, auditDetails }).to(`/v1/portal/deals/${createdDeal._id}/status`);

      expect(status).toEqual(200);

      expect(body.status).toEqual(acknowledgedStatus);
      expect(body.previousStatus).toEqual(submittedStatus);
      expect(typeof body.updatedAt).toEqual('number');
    });
  });
});
