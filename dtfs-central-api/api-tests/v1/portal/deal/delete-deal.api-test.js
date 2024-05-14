const { ObjectId } = require('mongodb');
const {
  generatePortalAuditDetails,
  withDeletionAuditLogsTests,
  generateMockPortalUserAuditDatabaseRecord,
} = require('@ukef/dtfs2-common/change-stream');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const { DEALS } = require('../../../../src/constants');
const aDeal = require('../../deal-builder');
const { MOCK_PORTAL_USER } = require('../../../mocks/test-users/mock-portal-user');
const { withValidateAuditDetailsTests } = require('../../../helpers/with-validate-audit-details.api-tests');

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

describe('DELETE /v1/portal/deals', () => {
  let documentToDeleteId;

  withValidateAuditDetailsTests({
    makeRequest: async (auditDetails) =>
      await api
        .remove({
          auditDetails,
        })
        .to(`/v1/portal/deals/${documentToDeleteId}`),
    validUserTypes: ['portal'],
  });

  if (process.env.CHANGE_STREAM_ENABLED === 'true') {
    beforeEach(async () => {
      const postResult = await api.post({ deal: newDeal, user: MOCK_PORTAL_USER }).to('/v1/portal/deals');
      documentToDeleteId = new ObjectId(postResult.body._id);
    });

    withDeletionAuditLogsTests({
      makeRequest: async () => {
        await api
          .remove({
            auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
          })
          .to(`/v1/portal/deals/${documentToDeleteId}`);
      },
      collectionName: 'deals',
      auditRecord: generateMockPortalUserAuditDatabaseRecord(MOCK_PORTAL_USER._id),
      getDeletedDocumentId: () => documentToDeleteId,
    });
  } else {
    it('returns 200 response', async () => {
      const { status } = await api
        .remove({
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to(`/v1/portal/deals/${documentToDeleteId}`);
      expect(status).toBe(200);
    });
  }
});
