import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { MONGO_DB_COLLECTIONS, AnyObject, DealSubmissionType, DealType } from '@ukef/dtfs2-common';
import { aTfmUser } from '@ukef/dtfs2-common/mock-data-backend';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { withMongoIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import wipeDB from '../../../wipeDB';
import { testApi } from '../../../test-api';
import { DEALS } from '../../../../server/constants';
import aDeal from '../../deal-builder';
import { createDeal, submitDealToTfm } from '../../../helpers/create-deal';
import { aPortalUser } from '../../../../test-helpers';

const originalProcessEnv = { ...process.env };

const auditDetails = generateTfmAuditDetails(aTfmUser()._id);

describe('/v1/tfm/deals/:dealId/cancellation', () => {
  let dealId: string;
  let dealCancellationUrl: string;

  const newDeal = aDeal({
    dealType: DEALS.DEAL_TYPE.BSS_EWCS,
    submissionType: DEALS.SUBMISSION_TYPE.AIN,
  }) as AnyObject;

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.DEALS]);
  });

  beforeEach(async () => {
    const createDealResponse: { body: { _id: string } } = await createDeal({ deal: newDeal, user: aPortalUser() });
    dealId = createDealResponse.body._id;
    dealCancellationUrl = `/v1/tfm/deals/${dealId}/cancellation`;

    await submitDealToTfm({ dealId, dealSubmissionType: newDeal.submissionType as DealSubmissionType, dealType: newDeal.dealType as DealType });
  });

  afterEach(async () => {
    process.env = { ...originalProcessEnv };
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.DEALS]);
  });

  describe('DELETE /v1/tfm/deals/:dealId/cancellation', () => {
    describe('when FF_TFM_DEAL_CANCELLATION_ENABLED is disabled', () => {
      beforeEach(() => {
        process.env.FF_TFM_DEAL_CANCELLATION_ENABLED = 'false';
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('should return 404', async () => {
        const { status } = await testApi.remove({ auditDetails }).to(dealCancellationUrl);

        expect(status).toEqual(HttpStatusCode.NotFound);
      });
    });

    describe('when FF_TFM_DEAL_CANCELLATION_ENABLED is enabled', () => {
      beforeEach(() => {
        process.env.FF_TFM_DEAL_CANCELLATION_ENABLED = 'true';
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      withMongoIdPathParameterValidationTests({
        baseUrl: '/v1/tfm/deals/:dealId/cancellation',
        makeRequest: (url) => testApi.remove({ auditDetails }).to(url),
      });

      it('should delete the deal cancellation object', async () => {
        const dealCancellation = {
          reason: 'test reason',
          bankRequestDate: 1794418807,
          effectiveFrom: 1794419907,
        };

        await testApi.put({ dealCancellationUpdate: dealCancellation, auditDetails: generateTfmAuditDetails(aTfmUser()._id) }).to(dealCancellationUrl);

        const deleteCancellationResponse = await testApi.remove({ auditDetails }).to(dealCancellationUrl);

        expect(deleteCancellationResponse.status).toEqual(HttpStatusCode.NoContent);

        const getCancellationResponse = await testApi.get(dealCancellationUrl);

        expect(getCancellationResponse.body).toEqual({});
      });

      it('should return 404 if dealId is valid but not associated to a deal', async () => {
        const validButNonExistentDealId = new ObjectId().toString();

        const deleteCancellationResponse = await testApi.remove({ auditDetails }).to(`/v1/tfm/deals/${validButNonExistentDealId}/cancellation`);

        expect(deleteCancellationResponse.status).toEqual(HttpStatusCode.NotFound);
        expect(deleteCancellationResponse.body).toEqual({
          status: HttpStatusCode.NotFound,
          message: `Deal not found: ${validButNonExistentDealId}`,
        });
      });

      it('should return 400 if invalid dealId', async () => {
        const invalidDealId = '1234';

        const deleteCancellationResponse = await testApi.remove({ auditDetails }).to(`/v1/tfm/deals/${invalidDealId}/cancellation`);
        expect(deleteCancellationResponse.status).toEqual(400);
        expect(deleteCancellationResponse.body).toEqual({
          code: 'INVALID_MONGO_ID_PATH_PARAMETER',
          message: "Expected path parameter 'dealId' to be a valid mongo id",
        });
      });
    });
  });
});
