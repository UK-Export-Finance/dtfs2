const { ObjectId } = require('mongodb');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { withDeleteOneTests } = require('@ukef/dtfs2-common/change-stream/test-helpers');
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
});

describe('DELETE /v1/portal/deals', () => {
  let dealToDeleteId;

  beforeEach(async () => {
    const postResult = await api.post({ deal: newDeal, user: MOCK_PORTAL_USER }).to('/v1/portal/deals');
    dealToDeleteId = new ObjectId(postResult.body._id);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  withValidateAuditDetailsTests({
    makeRequest: async (auditDetails) =>
      await api
        .remove({
          auditDetails,
        })
        .to(`/v1/portal/deals/${dealToDeleteId}`),
    validUserTypes: ['portal'],
  });

  withDeleteOneTests({
    makeRequest: async () => {
      await api
        .remove({
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to(`/v1/portal/deals/${dealToDeleteId}`);
    },
    collectionName: 'deals',
    auditRecord: generateMockPortalUserAuditDatabaseRecord(MOCK_PORTAL_USER._id),
    getDeletedDocumentId: () => dealToDeleteId,
  });
});
