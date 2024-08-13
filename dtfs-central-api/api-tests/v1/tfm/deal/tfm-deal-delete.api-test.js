const { ObjectId } = require('mongodb');
const { MONGO_DB_COLLECTIONS, FACILITY_TYPE } = require('@ukef/dtfs2-common');
const { withDeleteOneTests, generateMockTfmUserAuditDatabaseRecord, withDeleteManyTests } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { generateTfmAuditDetails, generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { testApi } = require('../../../test-api');
const { DEALS } = require('../../../../src/constants');
const aDeal = require('../../deal-builder');
const { withValidateAuditDetailsTests } = require('../../../helpers/with-validate-audit-details.api-tests');
const { MOCK_TFM_USER } = require('../../../mocks/test-users/mock-tfm-user');
const { MOCK_PORTAL_USER } = require('../../../mocks/test-users/mock-portal-user');
const { createDeal } = require('../../../helpers/create-deal');
const { mongoDbClient } = require('../../../../src/drivers/db-client');
const { createFacility } = require('../../../helpers/create-facility');

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
    type: FACILITY_TYPE.BOND,
    ukefFacilityId: '223344',
    value: '2000',
    coverEndDate: '2021-08-12T00:00:00.000Z',
    currency: { id: 'GBP' },
  },
  {
    type: FACILITY_TYPE.LOAN,
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
      const postResult = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });
      const portalDealId = postResult.body._id;
      await Promise.all(newFacilities.map((facility) => createFacility({ facility: { ...facility, dealId: portalDealId }, user: MOCK_PORTAL_USER })));

      const submitResult = await testApi
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
        await testApi
          .remove({
            auditDetails,
          })
          .to(`/v1/tfm/deals/${tfmDealToDeleteId}`),
      validUserTypes: ['portal', 'none', 'tfm', 'system'],
    });

    withDeleteOneTests({
      makeRequest: () =>
        testApi
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
        testApi
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
