import { ObjectId } from 'mongodb';
import { AUDIT_USER_TYPES_REQUIRING_ID, AuditDetails, Deal, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails, generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { withMongoIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import { withValidateAuditDetailsTests } from '../../../helpers/with-validate-audit-details.api-tests';
import wipeDB from '../../../wipeDB';
import { testApi } from '../../../test-api';
import { DEALS } from '../../../../src/constants';
import aDeal from '../../deal-builder';
import { createDeal } from '../../../helpers/create-deal';
import { aPortalUser, aTfmUser } from '../../../../test-helpers';
import { MOCK_PORTAL_USER } from '../../../mocks/test-users/mock-portal-user';

console.error = jest.fn();

describe('PUT TFM deal cancellation', () => {
  let dealId;
  let dealCancellationUrl: string;
  let tfmAuditDetails: AuditDetails;
  let tfmUserId;

  const newDeal: Deal = aDeal({
    dealType: DEALS.DEAL_TYPE.BSS_EWCS,
    submissionType: DEALS.SUBMISSION_TYPE.AIN,
  });

  const dealCancellationUpdate = {
    reason: 'test reason',
    bankRequestDate: 1794418807,
    effectiveFrom: 1794419907,
  };

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_DEALS]);
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
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_DEALS]);
  });

  describe('PUT /v1/tfm/deals/:dealId/cancellation', () => {
    withMongoIdPathParameterValidationTests({
      baseUrl: '/v1/tfm/deals/:dealId/cancellation',
      makeRequest: (url) => testApi.put({}).to(url),
    });

    withValidateAuditDetailsTests({
      makeRequest: async (auditDetails) => await testApi.put({ auditDetails, dealCancellationUpdate }).to(dealCancellationUrl),
      validUserTypes: [AUDIT_USER_TYPES_REQUIRING_ID.TFM],
    });

    it('should update an deal with the deal cancellation based on dealId', async () => {
      const { status, body } = await testApi.put({ dealCancellationUpdate, auditDetails: tfmAuditDetails }).to(dealCancellationUrl);

      const expected = {
        acknowledged: true,
        modifiedCount: 1,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 1,
      };
      expect(body).toEqual(expected);
      expect(status).toEqual(200);
    });

    it('should return 404 if dealId is valid but NOT associated to a record', async () => {
      const validButNonExistentDealId = new ObjectId().toString();

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
