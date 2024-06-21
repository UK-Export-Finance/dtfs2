const { AUDIT_USER_TYPES } = require('@ukef/dtfs2-common');
const { ObjectId } = require('mongodb');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { withDeleteOneTests, generateMockPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { withValidateAuditDetailsTests } = require('../../helpers/with-validate-audit-details.api-tests');
const { testApi } = require('../../test-api');
const { DEALS } = require('../../../src/constants');
const aDeal = require('../deal-builder');
const { MOCK_PORTAL_USER } = require('../../mocks/test-users/mock-portal-user');
const { createDeal } = require('../../helpers/create-deal');
const { createFacility } = require('../../helpers/create-facility');

const newDeal = aDeal({
  dealType: DEALS.DEAL_TYPE.BSS_EWCS,
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
});

describe('DELETE /v1/portal/facilities/:id', () => {
  let dealId;
  let documentToDeleteId;

  beforeEach(async () => {
    const { body: deal } = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });
    dealId = deal._id;

    const createFacilityResult = await createFacility({
      facility: {
        dealId,
        type: 'Bond',
      },
      user: MOCK_PORTAL_USER,
    });
    documentToDeleteId = new ObjectId(createFacilityResult.body._id);

    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  withValidateAuditDetailsTests({
    makeRequest: async (auditDetails) =>
      await testApi
        .remove({
          dealId,
          user: MOCK_PORTAL_USER,
          auditDetails,
        })
        .to(`/v1/portal/facilities/${documentToDeleteId}`),
    validUserTypes: [AUDIT_USER_TYPES.PORTAL],
  });

  withDeleteOneTests({
    makeRequest: async () =>
      await testApi
        .remove({
          dealId,
          user: MOCK_PORTAL_USER,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to(`/v1/portal/facilities/${documentToDeleteId}`),
    collectionName: 'facilities',
    auditRecord: generateMockPortalUserAuditDatabaseRecord(MOCK_PORTAL_USER._id),
    getDeletedDocumentId: () => documentToDeleteId,
  });

  it('removes the facility from the deal', async () => {
    await testApi
      .remove({
        dealId,
        user: MOCK_PORTAL_USER,
        auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
      })
      .to(`/v1/portal/facilities/${documentToDeleteId}`);

    const getDealResponse = await testApi.get(`/v1/portal/deals/${dealId}`);

    const facilityOnDeal = getDealResponse.body.deal.facilities.find((facility) => facility._id === documentToDeleteId);
    expect(facilityOnDeal).toBeFalsy();
  });
});
