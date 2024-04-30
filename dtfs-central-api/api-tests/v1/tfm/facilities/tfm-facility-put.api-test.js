const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const {
  generatePortalAuditDetails,
  generateTfmAuditDetails,
  generateParsedMockTfmUserAuditDatabaseRecord,
} = require('@ukef/dtfs2-common/change-stream');
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
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
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

      const { status } = await api
        .put({ facility: newFacility, user: MOCK_PORTAL_USER })
        .to('/v1/tfm/facilities/61e54e2e532cf2027303e001');

      expect(status).toEqual(404);
    });

    describe('with a valid deal submitted to TFM', () => {
      let createdFacility;

      beforeEach(async () => {
        const postResult = await api
          .post({ facility: newFacility, user: MOCK_PORTAL_USER })
          .to('/v1/portal/facilities');
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
        makeRequest: (auditDetails) =>
          api
            .put({ auditDetails, dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS, dealId })
            .to(`/v1/tfm/facilities/${createdFacility._id}`),
        validUserTypes: ['system', 'portal', 'tfm', 'none'],
      });

      it('returns the updated facility', async () => {
        const updatedFacility = {
          tfmUpdate: {
            bondIssuerPartyUrn: 'testUrn',
          },
          auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id),
        };

        const { body, status } = await api.put(updatedFacility).to(`/v1/tfm/facilities/${createdFacility._id}`);

        expect(status).toEqual(200);
        expect(body.tfm).toEqual(updatedFacility.tfmUpdate);
        expect(body.auditRecord).toEqual(generateParsedMockTfmUserAuditDatabaseRecord(MOCK_TFM_USER._id));
      });
    });
  });
});
