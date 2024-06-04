const { ObjectId } = require('mongodb');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { withDeleteOneTests, generateMockPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { withValidateAuditDetailsTests } = require('../../helpers/with-validate-audit-details.api-tests');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const { DEALS } = require('../../../src/constants');
const aDeal = require('../deal-builder');
const { MOCK_PORTAL_USER } = require('../../mocks/test-users/mock-portal-user');

const newDeal = aDeal({
  dealType: DEALS.DEAL_TYPE.BSS_EWCS,
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
});

describe('DELETE /v1/portal/facilities/:id', () => {
  let dealId;
  let documentToDeleteId;

  beforeEach(async () => {
    const createDealResult = await api.post({ deal: newDeal, user: MOCK_PORTAL_USER }).to('/v1/portal/deals');
    dealId = createDealResult.body._id;

    const createFacilityResult = await api
      .post({
        facility: {
          dealId,
          type: 'Bond',
        },
        user: MOCK_PORTAL_USER,
      })
      .to('/v1/portal/facilities');

    documentToDeleteId = new ObjectId(createFacilityResult.body._id);

    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  withValidateAuditDetailsTests({
    makeRequest: async (auditDetails) =>
      await api
        .remove({
          dealId,
          user: MOCK_PORTAL_USER,
          auditDetails,
        })
        .to(`/v1/portal/facilities/${documentToDeleteId}`),
    validUserTypes: ['portal'],
  });

  withDeleteOneTests({
    makeRequest: async () =>
      await api
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
    await api
      .remove({
        dealId,
        user: MOCK_PORTAL_USER,
        auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
      })
      .to(`/v1/portal/facilities/${documentToDeleteId}`);

    const getDealResponse = await api.get(`/v1/portal/deals/${dealId}`);

    const facilityOnDeal = getDealResponse.body.deal.facilities.find((facility) => facility._id === documentToDeleteId);
    expect(facilityOnDeal).toBeFalsy();
  });
});
