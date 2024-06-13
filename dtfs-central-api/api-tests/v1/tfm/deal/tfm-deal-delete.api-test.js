const { ObjectId } = require('mongodb');
const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { withDeleteOneTests, generateMockTfmUserAuditDatabaseRecord, withDeleteManyTests } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { generateTfmAuditDetails, generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const { DEALS, FACILITIES } = require('../../../../src/constants');
const aDeal = require('../../deal-builder');
const { withValidateAuditDetailsTests } = require('../../../helpers/with-validate-audit-details.api-tests');
const { MOCK_TFM_USER } = require('../../../mocks/test-users/mock-tfm-user');
const { MOCK_PORTAL_USER } = require('../../../mocks/test-users/mock-portal-user');
const { createDeal } = require('../../../helpers/create-deal');
const { mongoDbClient } = require('../../../../src/drivers/db-client');

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

const newFacilities = [
  {
    type: FACILITIES.FACILITY_TYPE.BOND,
    ukefFacilityId: '223344',
    value: '2000',
    coverEndDate: '2021-08-12T00:00:00.000Z',
    currency: { id: 'GBP' },
  },
  {
    type: FACILITIES.FACILITY_TYPE.LOAN,
    ukefFacilityId: '223345',
    value: '2000',
    coverEndDate: '2021-08-12T00:00:00.000Z',
    currency: { id: 'GBP' },
  },
];

describe('/v1/tfm/deal/:id', () => {
  describe('DELETE /v1/tfm/deals', () => {
    let tfmDealToDeleteId;
    let tfmFacilitiesToDeleteIds;

    beforeEach(async () => {
      const postResult = await createDeal({ api, deal: newDeal, user: MOCK_PORTAL_USER });
      const portalDealId = postResult.body._id;

      await Promise.all(
        newFacilities.map((facility) => api.post({ facility: { ...facility, dealId: portalDealId }, user: MOCK_PORTAL_USER }).to('/v1/portal/facilities')),
      );

      const submitResult = await api
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId: portalDealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      tfmDealToDeleteId = new ObjectId(submitResult.body._id);

      const tfmFacilityCollection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES);
      tfmFacilitiesToDeleteIds = (await tfmFacilityCollection.find({ 'facilitySnapshot.dealId': { $eq: tfmDealToDeleteId } }).toArray()).map(({ _id }) => _id);
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
          .to(`/v1/tfm/deals/${tfmDealToDeleteId}`),
      validUserTypes: ['portal', 'none', 'tfm', 'system'],
    });

    withDeleteOneTests({
      makeRequest: () =>
        api
          .remove({
            auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id),
          })
          .to(`/v1/tfm/deals/${tfmDealToDeleteId}`),
      collectionName: MONGO_DB_COLLECTIONS.TFM_DEALS,
      auditRecord: generateMockTfmUserAuditDatabaseRecord(MOCK_TFM_USER._id),
      getDeletedDocumentId: () => tfmDealToDeleteId,
      expectedStatusWhenNoDeletion: 404,
    });

    withDeleteManyTests({
      makeRequest: () =>
        api
          .remove({
            auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id),
          })
          .to(`/v1/tfm/deals/${tfmDealToDeleteId}`),
      collectionName: MONGO_DB_COLLECTIONS.TFM_FACILITIES,
      auditRecord: generateMockTfmUserAuditDatabaseRecord(MOCK_TFM_USER._id),
      getDeletedDocumentIds: () => tfmFacilitiesToDeleteIds,
      expectedSuccessResponseBody: { acknowledged: true, deletedCount: 1 },
    });
  });
});
