const actualDb = jest.requireActual('../../../src/drivers/db-client').default;
const mockGetCollection = jest.fn(actualDb.getCollection.bind(actualDb));

jest.mock('../../../src/drivers/db-client', () => ({
  __esModule: true,
  default: {
    getCollection: mockGetCollection,
    getClient: actualDb.getClient.bind(actualDb),
    getConnection: actualDb.getConnection.bind(actualDb),
  },
}));

const { ObjectId } = require('mongodb');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { withDeletionAuditLogsTests } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { generateMockPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');

const app = require('../../../src/createApp');
const api = require('../../api')(app);
const { DEALS } = require('../../../src/constants');
const aDeal = require('../deal-builder');
const { MOCK_PORTAL_USER } = require('../../mocks/test-users/mock-portal-user');
const { withValidateAuditDetailsTests } = require('../../helpers/with-validate-audit-details.api-tests');

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

  beforeEach(async () => {
    const postResult = await api.post({ deal: newDeal, user: MOCK_PORTAL_USER }).to('/v1/portal/deals');
    documentToDeleteId = new ObjectId(postResult.body._id);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

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
      mockGetCollection,
    });
  } else {
    it('deletes the deal', async () => {
      const deleteResponse = await api
        .remove({
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to(`/v1/portal/deals/${documentToDeleteId}`);
      expect(deleteResponse.status).toBe(200);

      const { status } = await api.get(`/v1/portal/deals/${documentToDeleteId}`);

      expect(status).toEqual(404);
    });
  }
});
