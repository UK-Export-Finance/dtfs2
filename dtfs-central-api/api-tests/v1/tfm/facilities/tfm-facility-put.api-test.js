const { generatePortalAuditDetails, generateTfmAuditDetails } = require('@ukef/dtfs2-common/src/helpers/change-stream/generate-audit-details');
const wipeDB = require('../../../wipeDB');
const app = require('../../../../src/createApp');
const api = require('../../../api')(app);
const { withValidateAuditDetailsTests } = require('../../../helpers/with-validate-audit-details.api-tests');
const aDeal = require('../../deal-builder');
const CONSTANTS = require('../../../../src/constants');
const { MOCK_PORTAL_USER } = require('../../../mocks/test-users/mock-portal-user');
const { MOCK_TFM_USER } = require('../../../mocks/test-users/mock-tfm-user');


const newFacility = {
  type: 'Bond',
  dealId: '123123456',
};

const newDeal = aDeal({
  dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
  details: {
    submissionCount: 0,
  },
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
});

const createDeal = async () => {
  const { body } = await api.post({ deal: newDeal, user: MOCK_PORTAL_USER }).to('/v1/portal/deals');
  return body;
};
describe('/v1/tfm/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe([CONSTANTS.DB_COLLECTIONS.DEALS, CONSTANTS.DB_COLLECTIONS.FACILITIES]);
  });

  beforeEach(async () => {
    const deal = await createDeal();

    dealId = deal._id;
    newFacility.dealId = dealId;
  });

  describe('PUT /v1/tfm/facilities/:id', () => {
    it('returns 404 when adding facility to non-existent deal', async () => {
      await api.post({ facility: newFacility, user: MOCK_PORTAL_USER }).to('/v1/portal/facilities');
      await api
        .put({
          dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
          dealId: '61e54e2e532cf2027303e001',
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const { status } = await api.put({ facility: newFacility, user: MOCK_PORTAL_USER }).to('/v1/tfm/facilities/61e54e2e532cf2027303e001');

      expect(status).toEqual(404);
    });

    describe('when validating audit details', () => {
      let createdFacility;

      beforeEach(async () => {
        const postResult = await api.post({ facility: newFacility, user: MOCK_PORTAL_USER }).to('/v1/portal/facilities');
        await api
          .put({
            dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
            dealId,
            auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
          })
          .to('/v1/tfm/deals/submit');

        createdFacility = postResult.body;
      });

      withValidateAuditDetailsTests({
        makeRequest: (payload) => api.put(payload).to(`/v1/tfm/facilities/${createdFacility._id}`),
        validUserTypes: ['system', 'portal', 'tfm'],
        payloadWithoutAuditDetails: {
          dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
        },
      });
    });

    it('returns the updated facility', async () => {
      const postResult = await api.post({ facility: newFacility, user: MOCK_PORTAL_USER }).to('/v1/portal/facilities');
      const createdFacility = postResult.body;

      const updatedFacility = {
        tfmUpdate: {
          bondIssuerPartyUrn: 'testUrn',
        },
        auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id),
      };

      await api
        .put({
          dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
          dealId,
          auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        })
        .to('/v1/tfm/deals/submit');

      const { body, status } = await api.put(updatedFacility).to(`/v1/tfm/facilities/${createdFacility._id}`);

      expect(status).toEqual(200);
      expect(body.tfm).toEqual(updatedFacility.tfmUpdate);
      expect(body.auditRecord).toEqual({
        lastUpdatedAt: expect.any(String),
        lastUpdatedByTfmUserId: null,
        lastUpdatedByIsSystem: null,
        lastUpdatedByPortalUserId: MOCK_PORTAL_USER._id,
        noUserLoggedIn: null,
      });
    });
  });
});
