const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { generatePortalAuditDetails, generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { generateParsedMockAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { withMongoIdPathParameterValidationTests } = require('@ukef/dtfs2-common/test-cases-backend');
const wipeDB = require('../../../wipeDB');
const { testApi } = require('../../../test-api');
const { withValidateAuditDetailsTests } = require('../../../helpers/with-validate-audit-details.api-tests');
const aDeal = require('../../deal-builder');
const { DEALS } = require('../../../../src/constants');
const { MOCK_PORTAL_USER } = require('../../../mocks/test-users/mock-portal-user');
const { createDeal } = require('../../../helpers/create-deal');
const { MOCK_TFM_USER } = require('../../../mocks/test-users/mock-tfm-user');
const { createFacility } = require('../../../helpers/create-facility');

const newFacility = {
  type: 'Bond',
  dealId: '123123456',
};

const newDeal = aDeal({
  dealType: DEALS.DEAL_TYPE.BSS_EWCS,
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

const portalAuditDetails = generatePortalAuditDetails(MOCK_PORTAL_USER._id);
const tfmAuditDetails = generateTfmAuditDetails(MOCK_TFM_USER._id);

describe('/v1/tfm/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES]);
  });

  beforeEach(async () => {
    const { body: deal } = await createDeal({ deal: newDeal, user: MOCK_PORTAL_USER, auditDetails: portalAuditDetails });

    dealId = deal._id;
    newFacility.dealId = dealId;
  });

  describe('PUT /v1/tfm/facilities/:id', () => {
    withMongoIdPathParameterValidationTests({
      baseUrl: '/v1/tfm/facilities/:id',
      makeRequest: (url) => testApi.put({}).to(url),
    });

    it('returns 404 when adding facility to non-existent deal', async () => {
      await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });
      await testApi
        .put({
          dealType: DEALS.DEAL_TYPE.BSS_EWCS,
          dealId: '61e54e2e532cf2027303e001',
          auditDetails: portalAuditDetails,
        })
        .to('/v1/tfm/deals/submit');

      const { status } = await testApi
        .put({ facility: newFacility, user: MOCK_PORTAL_USER, auditDetails: tfmAuditDetails })
        .to('/v1/tfm/facilities/61e54e2e532cf2027303e001');

      expect(status).toEqual(404);
    });

    describe('with a valid deal submitted to TFM', () => {
      let createdFacility;

      beforeEach(async () => {
        const postResult = await createFacility({ facility: newFacility, user: MOCK_PORTAL_USER });

        await testApi
          .put({
            dealType: DEALS.DEAL_TYPE.BSS_EWCS,
            dealId,
            auditDetails: portalAuditDetails,
          })
          .to('/v1/tfm/deals/submit');

        createdFacility = postResult.body;
      });

      withValidateAuditDetailsTests({
        makeRequest: (auditDetails) =>
          testApi.put({ auditDetails, dealType: DEALS.DEAL_TYPE.BSS_EWCS, dealId }).to(`/v1/tfm/facilities/${createdFacility._id}`),
      });

      it('returns the updated facility', async () => {
        const updatedFacility = {
          tfmUpdate: {
            bondIssuerPartyUrn: 'testUrn',
          },
          auditDetails: portalAuditDetails,
        };

        const { body, status } = await testApi.put(updatedFacility).to(`/v1/tfm/facilities/${createdFacility._id}`);

        expect(status).toEqual(200);
        expect(body.tfm).toEqual(updatedFacility.tfmUpdate);
        expect(body.auditRecord).toEqual(generateParsedMockAuditDatabaseRecord(portalAuditDetails));
      });
    });
  });
});
