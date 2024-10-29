const { MONGO_DB_COLLECTIONS, AUDIT_USER_TYPES_REQUIRING_ID, aTfmUser } = require('@ukef/dtfs2-common');
const { generateTfmAuditDetails, generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { withMongoIdPathParameterValidationTests } = require('@ukef/dtfs2-common/test-cases-backend');
const { ObjectId } = require('mongodb');
const { withValidateAuditDetailsTests } = require('../../../helpers/with-validate-audit-details.api-tests');
const wipeDB = require('../../../wipeDB');
const { testApi } = require('../../../test-api');
const { DEALS } = require('../../../../src/constants');
const aDeal = require('../../deal-builder');
const { createDeal } = require('../../../helpers/create-deal');
const { aPortalUser } = require('../../../../test-helpers');
const { MOCK_PORTAL_USER } = require('../../../mocks/test-users/mock-portal-user');

console.error = jest.fn();

const originalProcessEnv = { ...process.env };

describe('/v1/tfm/deals/:dealId/cancellation', () => {
  let dealId;
  let dealCancellationUrl;
  let tfmAuditDetails;
  let tfmUserId;

  const newDeal = aDeal({
    dealType: DEALS.DEAL_TYPE.BSS_EWCS,
    submissionType: DEALS.SUBMISSION_TYPE.AIN,
  });

  const dealCancellationUpdate = {
    reason: 'test reason',
    bankRequestDate: 1794418807,
    effectiveFrom: 1794419907,
  };

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.DEALS]);
  });

  beforeEach(async () => {
    const { body: deal } = await createDeal({ deal: newDeal, user: aPortalUser() });
    dealId = deal._id;
    dealCancellationUrl = `/v1/tfm/deals/${dealId}/cancellation`;
    tfmUserId = aTfmUser()._id;
    tfmAuditDetails = generateTfmAuditDetails(tfmUserId);

    await testApi
      .put({
        dealType: DEALS.DEAL_TYPE.BSS_EWCS,
        dealId,
        submissionType: DEALS.SUBMISSION_TYPE.AIN,
        auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
      })
      .to('/v1/tfm/deals/submit');
  });

  afterEach(async () => {
    process.env = { ...originalProcessEnv };
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.DEALS]);
  });

  describe('PUT /v1/tfm/deals/:dealId/cancellation', () => {
    describe('when FF_TFM_DEAL_CANCELLATION_ENABLED is disabled', () => {
      beforeEach(() => {
        process.env.FF_TFM_DEAL_CANCELLATION_ENABLED = 'false';
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('should return 404', async () => {
        const { status } = await testApi.put({ dealCancellationUpdate, auditDetails: tfmAuditDetails }).to(dealCancellationUrl);

        expect(status).toEqual(404);
      });
    });

    describe('when FF_TFM_DEAL_CANCELLATION_ENABLED is enabled', () => {
      beforeEach(() => {
        process.env.FF_TFM_DEAL_CANCELLATION_ENABLED = 'true';
      });

      withMongoIdPathParameterValidationTests({
        baseUrl: '/v1/tfm/deals/:dealId/cancellation',
        makeRequest: (url) => testApi.put({}).to(url),
      });

      withValidateAuditDetailsTests({
        makeRequest: async (auditDetails) => await testApi.put({ auditDetails, dealCancellationUpdate }).to(dealCancellationUrl),
        validUserTypes: [AUDIT_USER_TYPES_REQUIRING_ID.TFM],
      });

      it('should update a deal with the deal cancellation based on dealId', async () => {
        const { status, body: bodyPutResponse } = await testApi.put({ dealCancellationUpdate, auditDetails: tfmAuditDetails }).to(dealCancellationUrl);

        const expected = {
          acknowledged: true,
          modifiedCount: 1,
          upsertedId: null,
          upsertedCount: 0,
          matchedCount: 1,
        };
        expect(bodyPutResponse).toEqual(expected);
        expect(status).toEqual(200);
      });

      it('should return 404 if dealId is valid but NOT associated to a deal', async () => {
        const validButNonExistentDealId = new ObjectId();

        const { status } = await testApi
          .put({ dealCancellationUpdate, auditDetails: tfmAuditDetails })
          .to(`/v1/tfm/deals/${validButNonExistentDealId}/cancellation`);

        expect(status).toEqual(404);
      });

      it('should return 400 if invalid dealId', async () => {
        const invalidDealId = '1234';

        const { status } = await testApi.put({ dealCancellationUpdate, auditDetails: tfmAuditDetails }).to(`/v1/tfm/deals/${invalidDealId}/cancellation`);
        expect(status).toEqual(400);
      });
    });
  });
});
