const { MONGO_DB_COLLECTIONS, AUDIT_USER_TYPES, AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const { generatePortalAuditDetails, generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { withMongoIdPathParameterValidationTests } = require('@ukef/dtfs2-common/test-cases-backend');
const wipeDB = require('../../../wipeDB');
const { testApi } = require('../../../test-api');
const { withValidateAuditDetailsTests } = require('../../../helpers/with-validate-audit-details.api-tests');
const { DEALS } = require('../../../../src/constants');
const { MOCK_DEAL } = require('../../mocks/mock-data');
const aDeal = require('../../deal-builder');
const { MOCK_PORTAL_USER } = require('../../../mocks/test-users/mock-portal-user');
const { MOCK_TFM_USER } = require('../../../mocks/test-users/mock-tfm-user');
const { createDeal } = require('../../../helpers/create-deal');
const { createFacility } = require('../../../helpers/create-facility');

describe('POST TFM amendments', () => {
  let dealId;

  const newFacility = {
    type: 'Bond',
    dealId: MOCK_DEAL.DEAL_ID,
  };

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

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_FACILITIES, MONGO_DB_COLLECTIONS.TFM_DEALS]);
  });

  beforeEach(async () => {
    const { body: deal } = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER });
    dealId = deal._id;

    newFacility.dealId = dealId;
  });

  describe('POST /v1/tfm/facilities/:id/amendments', () => {
    withMongoIdPathParameterValidationTests({
      baseUrl: '/v1/tfm/facilities/:id/amendments',
      makeRequest: (url) => testApi.post({}).to(url),
    });

    describe('with a valid facility submitted to portal', () => {
      let facilityId;
      beforeEach(async () => {
        const postResult = await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });
        facilityId = postResult.body._id;

        await testApi
          .put({
            dealType: DEALS.DEAL_TYPE.BSS_EWCS,
            dealId,
            auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
          })
          .to('/v1/tfm/deals/submit');
      });

      withValidateAuditDetailsTests({
        makeRequest: (auditDetails) => testApi.post({ auditDetails }).to(`/v1/tfm/facilities/${facilityId}/amendments`),
        validUserTypes: [AUDIT_USER_TYPES.TFM],
      });

      it('should create a new amendment based on facilityId', async () => {
        const { body } = await testApi.post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to(`/v1/tfm/facilities/${facilityId}/amendments`);
        expect(body).toEqual({ amendmentId: expect.any(String) });
      });

      it('should update the auditRecord on the facility document', async () => {
        await testApi.post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to(`/v1/tfm/facilities/${facilityId}/amendments`);

        const { body: updatedFacility } = await testApi.get(`/v1/tfm/facilities/${facilityId}`);

        expect(updatedFacility.auditRecord).toEqual({
          lastUpdatedAt: expect.any(String),
          lastUpdatedByPortalUserId: null,
          lastUpdatedByTfmUserId: MOCK_TFM_USER._id,
          lastUpdatedByIsSystem: null,
          noUserLoggedIn: null,
        });
      });

      it('should return 409 if an in progress amendment already exists', async () => {
        const { body: bodyPostResponse1 } = await testApi
          .post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) })
          .to(`/v1/tfm/facilities/${facilityId}/amendments`);

        const updatePayload1 = { status: AMENDMENT_STATUS.IN_PROGRESS };
        await testApi
          .put({ payload: updatePayload1, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) })
          .to(`/v1/tfm/facilities/${facilityId}/amendments/${bodyPostResponse1.amendmentId}`);

        const { status } = await testApi.post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to(`/v1/tfm/facilities/${facilityId}/amendments`);
        expect(status).toEqual(409);
      });
    });

    it('should return 404 if the facility does not exist', async () => {
      const { status } = await testApi
        .post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) })
        .to('/v1/tfm/facilities/62727d055ca1841f08216353/amendments');

      expect(status).toEqual(404);
    });
  });
});
