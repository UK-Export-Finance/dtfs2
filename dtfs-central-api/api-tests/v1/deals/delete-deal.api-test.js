const { AUDIT_USER_TYPES } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { withDeleteOneTests } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { generateMockPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');

const { testApi } = require('../../test-api');
const { DEALS } = require('../../../src/constants');
const aDeal = require('../deal-builder');
const { MOCK_PORTAL_USER } = require('../../mocks/test-users/mock-portal-user');
const { withValidateAuditDetailsTests } = require('../../helpers/with-validate-audit-details.api-tests');
const { createDeal } = require('../../helpers/create-deal');

const newDeal = aDeal({
  dealType: DEALS.DEAL_TYPE.BSS_EWCS,
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
});

describe('DELETE /v1/portal/deals', () => {
  let dealToDeleteId;

  beforeEach(async () => {
    const postResult = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });
    dealToDeleteId = new ObjectId(postResult.body._id);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  withValidateAuditDetailsTests({
    makeRequest: (auditDetails) =>
      testApi
        .remove({
          auditDetails,
        })
        .to(`/v1/portal/deals/${dealToDeleteId}`),
    validUserTypes: [AUDIT_USER_TYPES.PORTAL],
  });

  withDeleteOneTests({
    makeRequest: () =>
      testApi
        .remove({
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to(`/v1/portal/deals/${dealToDeleteId}`),
    collectionName: 'deals',
    auditRecord: generateMockPortalUserAuditDatabaseRecord(MOCK_PORTAL_USER._id),
    getDeletedDocumentId: () => dealToDeleteId,
  });
});
