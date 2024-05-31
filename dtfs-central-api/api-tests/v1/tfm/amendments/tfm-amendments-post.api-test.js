const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { generatePortalAuditDetails, generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const { withValidateAuditDetailsTests } = require('../../../helpers/with-validate-audit-details.api-tests');
const CONSTANTS = require('../../../../src/constants');
const { MOCK_DEAL } = require('../../mocks/mock-data');
const aDeal = require('../../deal-builder');
const { MOCK_PORTAL_USER } = require('../../../mocks/test-users/mock-portal-user');
const { MOCK_TFM_USER } = require('../../../mocks/test-users/mock-tfm-user');
const { createDeal } = require('../../../helpers/create-deal');

describe('POST TFM amendments', () => {
  let dealId;

  const newFacility = {
    type: 'Bond',
    dealId: MOCK_DEAL.DEAL_ID,
  };

  const newDeal = aDeal({
    dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
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
    const { body: deal } = await createDeal({ api, deal: newDeal, user: MOCK_PORTAL_USER });
    dealId = deal._id;

    newFacility.dealId = dealId;
  });

  describe('POST /v1/tfm/facilities/:id/amendments', () => {
    describe('with a valid facility submitted to portal', () => {
      let facilityId;
      beforeEach(async () => {
        const postResult = await api.post({ facility: newFacility, user: MOCK_PORTAL_USER }).to('/v1/portal/facilities');
        facilityId = postResult.body._id;

        await api
          .put({
            dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
            dealId,
            auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
          })
          .to('/v1/tfm/deals/submit');
      });

      withValidateAuditDetailsTests({
        makeRequest: (auditDetails) => api.post({ auditDetails }).to(`/v1/tfm/facilities/${facilityId}/amendments`),
        validUserTypes: ['tfm'],
      });

      it('should create a new amendment based on facilityId', async () => {
        const { body } = await api.post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to(`/v1/tfm/facilities/${facilityId}/amendments`);
        expect(body).toEqual({ amendmentId: expect.any(String) });
      });

      it('should update the auditRecord on the facility document', async () => {
        await api.post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to(`/v1/tfm/facilities/${facilityId}/amendments`);

        const { body: updatedFacility } = await api.get(`/v1/tfm/facilities/${facilityId}`);

        expect(updatedFacility.auditRecord).toEqual({
          lastUpdatedAt: expect.any(String),
          lastUpdatedByPortalUserId: null,
          lastUpdatedByTfmUserId: MOCK_TFM_USER._id,
          lastUpdatedByIsSystem: null,
          noUserLoggedIn: null,
        });
      });

      it('should return 400 if an amendment already exists', async () => {
        const { body: bodyPostResponse1 } = await api
          .post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) })
          .to(`/v1/tfm/facilities/${facilityId}/amendments`);

        const updatePayload1 = { status: CONSTANTS.AMENDMENT.AMENDMENT_STATUS.IN_PROGRESS };
        await api
          .put({ payload: updatePayload1, auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) })
          .to(`/v1/tfm/facilities/${facilityId}/amendments/${bodyPostResponse1.amendmentId}`);

        const { body } = await api.post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to(`/v1/tfm/facilities/${facilityId}/amendments`);
        expect(body).toEqual({ status: 400, message: 'The current facility already has an amendment in progress' });
      });
    });

    it('should return 404 if the facility does not exist', async () => {
      const { body } = await api
        .post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) })
        .to('/v1/tfm/facilities/62727d055ca1841f08216353/amendments');

      expect(body).toEqual({ status: 404, message: 'The current facility does not exist' });
    });

    it('should return 400 if the facility Id is not valid', async () => {
      await api
        .put({
          dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const { body } = await api.post({ auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id) }).to('/v1/tfm/facilities/123/amendments');
      expect(body).toEqual({ status: 400, message: 'Invalid facility id' });
    });
  });
});
