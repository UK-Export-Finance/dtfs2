import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import {
  MONGO_DB_COLLECTIONS,
  AnyObject,
  API_ERROR_CODE,
  TfmAuditDetails,
  TfmDealCancellationResponse,
  FACILITY_TYPE,
  DealSubmissionType,
  DealType,
} from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { withMongoIdPathParameterValidationTests } from '@ukef/dtfs2-common/test-cases-backend';
import wipeDB from '../../../wipeDB';
import { testApi } from '../../../test-api';
import { DEALS } from '../../../../src/constants';
import aDeal from '../../deal-builder';
import { createDeal, submitDealToTfm } from '../../../helpers/create-deal';
import { aPortalUser } from '../../../../test-helpers';
import { createFacility } from '../../../helpers/create-facility';
import { createTfmUser } from '../../../helpers/create-tfm-user';

const originalProcessEnv = { ...process.env };

describe('/v1/tfm/deals/:dealId/cancellation/submit', () => {
  let dealId: string;
  const ukefFacilityId = 'ukefFacilityId';
  let submitDealCancellationUrl: string;
  let auditDetails: TfmAuditDetails;
  let tfmUserId: string;

  const cancellation = {
    reason: 'test reason',
    bankRequestDate: new Date().valueOf(),
    effectiveFrom: new Date().valueOf(),
  };

  const ukefDealId = 'ukefDealId';

  const newDeal = aDeal({
    dealType: DEALS.DEAL_TYPE.BSS_EWCS,
    submissionType: DEALS.SUBMISSION_TYPE.AIN,
    details: { ukefDealId },
  }) as AnyObject;

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);

    const tfmUser = await createTfmUser();
    tfmUserId = tfmUser._id;
  });

  beforeEach(async () => {
    const createDealResponse: { body: { _id: string } } = await createDeal({ deal: newDeal, user: aPortalUser() });
    dealId = createDealResponse.body._id;

    await createFacility({
      facility: {
        dealId,
        type: FACILITY_TYPE.BOND,
        ukefFacilityId,
      },
      user: aPortalUser(),
    });

    auditDetails = generateTfmAuditDetails(tfmUserId);
    submitDealCancellationUrl = `/v1/tfm/deals/${dealId}/cancellation/submit`;

    await submitDealToTfm({ dealId, dealSubmissionType: newDeal.submissionType as DealSubmissionType, dealType: newDeal.dealType as DealType });

    await testApi
      .put({
        dealUpdate: {
          tfm: {
            cancellation,
          },
        },
        auditDetails,
      })
      .to(`/v1/tfm/deals/${dealId}`);
  });

  afterEach(async () => {
    process.env = { ...originalProcessEnv };
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_DEALS, MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
  });

  describe('POST /v1/tfm/deals/:dealId/cancellation/submit', () => {
    describe('when FF_TFM_DEAL_CANCELLATION_ENABLED is disabled', () => {
      beforeEach(() => {
        process.env.FF_TFM_DEAL_CANCELLATION_ENABLED = 'false';
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('should return 404', async () => {
        const { status } = await testApi.post({ cancellation, auditDetails }).to(submitDealCancellationUrl);

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
        baseUrl: '/v1/tfm/deals/:dealId/cancellation/submit',
        makeRequest: (url) => testApi.post({ cancellation, auditDetails }).to(url),
      });

      it('should return the submit cancellation response object if a matching deal and cancellation exists', async () => {
        const submitCancellationResponse = await testApi.post({ cancellation, auditDetails }).to(submitDealCancellationUrl);

        expect(submitCancellationResponse.body).toEqual({
          cancelledDealUkefId: ukefDealId,
          riskExpiredFacilityUkefIds: [ukefFacilityId],
        } as TfmDealCancellationResponse);
        expect(submitCancellationResponse.status).toEqual(HttpStatusCode.Ok);
      });

      it('should return 404 if deal is valid but the existing cancellation does not match the passed in params', async () => {
        const differentDealCancellationDetails = { ...cancellation, reason: 'a different reason' };

        const submitCancellationResponse = await testApi.post({ cancellation: differentDealCancellationDetails, auditDetails }).to(submitDealCancellationUrl);

        expect(submitCancellationResponse.status).toEqual(HttpStatusCode.NotFound);
        expect(submitCancellationResponse.body).toEqual({
          status: HttpStatusCode.NotFound,
          message: `Deal not found: ${dealId}`,
        });
      });

      it('should return 404 if dealId is valid but not associated to a deal', async () => {
        const validButNonExistentDealId = new ObjectId();

        const submitCancellationResponse = await testApi
          .post({ cancellation, auditDetails })
          .to(`/v1/tfm/deals/${validButNonExistentDealId.toString()}/cancellation/submit`);

        expect(submitCancellationResponse.status).toEqual(HttpStatusCode.NotFound);
        expect(submitCancellationResponse.body).toEqual({
          status: HttpStatusCode.NotFound,
          message: `Deal not found: ${validButNonExistentDealId.toString()}`,
        });
      });

      it('should return 400 if invalid dealId', async () => {
        const invalidDealId = '1234';

        const submitCancellationResponse = await testApi.post({ cancellation, auditDetails }).to(`/v1/tfm/deals/${invalidDealId}/cancellation/submit`);
        expect(submitCancellationResponse.status).toEqual(400);
        expect(submitCancellationResponse.body).toEqual({
          code: 'INVALID_MONGO_ID_PATH_PARAMETER',
          message: "Expected path parameter 'dealId' to be a valid mongo id",
        });
      });

      it('should return 400 if auditDetails are valid but do not correspond to a user', async () => {
        const invalidAuditDetails = generateTfmAuditDetails(new ObjectId());

        const submitCancellationResponse = await testApi
          .post({ cancellation, auditDetails: invalidAuditDetails })
          .to(`/v1/tfm/deals/${dealId}/cancellation/submit`);

        expect(submitCancellationResponse.status).toEqual(400);
        expect(submitCancellationResponse.body).toEqual({
          code: 'INVALID_AUDIT_DETAILS',
          message: `Supplied auditDetails 'id' ${invalidAuditDetails.id.toString()} does not correspond to a valid user`,
          status: 400,
        });
      });

      it('should return 400 if the payload is invalid', async () => {
        const invalidPayload = {
          reason: '',
          bankRequestDate: new Date().valueOf(),
          effectiveFrom: undefined,
        };

        const submitCancellationResponse = await testApi.post({ cancellation: invalidPayload, auditDetails }).to(submitDealCancellationUrl);

        expect(submitCancellationResponse.status).toEqual(400);
        expect(submitCancellationResponse.body).toHaveProperty('code', API_ERROR_CODE.INVALID_PAYLOAD);
      });
    });
  });
});
