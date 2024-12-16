import { Response } from 'supertest';
import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import {
  AMENDMENT_TYPES,
  AnyObject,
  API_ERROR_CODE,
  DEAL_SUBMISSION_TYPE,
  DEAL_TYPE,
  FACILITY_TYPE,
  MONGO_DB_COLLECTIONS,
  PortalFacilityAmendment,
} from '@ukef/dtfs2-common';
import wipeDB from '../../wipeDB';
import { testApi } from '../../test-api';
import { createDeal, submitDealToTfm } from '../../helpers/create-deal';
import aDeal from '../deal-builder';
import { aPortalUser } from '../../mocks/test-users/portal-user';
import { createPortalUser } from '../../helpers/create-portal-user';
import { createPortalFacilityAmendment } from '../../helpers/create-portal-facility-amendment';

const originalEnv = { ...process.env };

interface FacilityAmendmentResponse extends Response {
  body: PortalFacilityAmendment;
}

const generateUrl = (facilityId: string, amendmentId: string): string => {
  return `/v1/portal/facilities/${facilityId}/amendments/${amendmentId}`;
};

const newDeal = aDeal({
  dealType: DEAL_TYPE.GEF,
  submissionType: DEAL_SUBMISSION_TYPE.AIN,
}) as AnyObject;

describe('GET /v1/portal/facilities/:facilityId/amendments/:amendmentId', () => {
  let dealId: string;
  let facilityId: string;
  let portalUserId: string;

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);

    portalUserId = (await createPortalUser())._id;
  });

  beforeEach(async () => {
    const createDealResponse: { body: { _id: string } } = await createDeal({ deal: newDeal, user: aPortalUser() });
    dealId = createDealResponse.body._id;

    const createFacilityResponse: { body: { _id: string } } = await testApi
      .post({ dealId, type: FACILITY_TYPE.CASH, hasBeenIssued: false })
      .to('/v1/portal/gef/facilities');

    facilityId = createFacilityResponse.body._id;

    await submitDealToTfm({ dealId, dealSubmissionType: DEAL_SUBMISSION_TYPE.AIN, dealType: DEAL_TYPE.GEF });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('with FF_PORTAL_FACILITY_AMENDMENTS_ENABLED set to `false`', () => {
    beforeAll(() => {
      process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'false';
    });

    it('should return 404', async () => {
      const { status } = (await testApi.get(generateUrl(facilityId, new ObjectId().toString()))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.NotFound);
    });
  });

  describe('with FF_PORTAL_FACILITY_AMENDMENTS_ENABLED set to `true`', () => {
    let amendmentId: string;

    beforeEach(async () => {
      const amendment = await createPortalFacilityAmendment({ dealId, facilityId, userId: portalUserId });

      amendmentId = amendment.amendmentId.toString();
    });

    beforeAll(() => {
      process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'true';
    });

    it('should return 400 when the facility id is invalid', async () => {
      const anInvalidFacilityId = 'InvalidId';

      const { status, body } = (await testApi.get(generateUrl(anInvalidFacilityId, amendmentId))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.BadRequest);

      expect(body).toEqual({
        message: "Expected path parameter 'facilityId' to be a valid mongo id",
        code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
      });
    });

    it('should return 400 when the amendment id is invalid', async () => {
      const anInvalidAmendmentId = 'InvalidId';

      const { status, body } = (await testApi.get(generateUrl(facilityId, anInvalidAmendmentId))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.BadRequest);

      expect(body).toEqual({
        message: "Expected path parameter 'amendmentId' to be a valid mongo id",
        code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
      });
    });

    it('should return 404 when the facility does not exist', async () => {
      const aValidButNonExistentFacilityId = new ObjectId().toString();

      const { status, body } = (await testApi.get(generateUrl(aValidButNonExistentFacilityId, amendmentId))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.NotFound);
      expect(body).toEqual({
        status: HttpStatusCode.NotFound,
        message: `Facility not found: ${aValidButNonExistentFacilityId}`,
      });
    });

    it('should return 404 when the amendment does not exist', async () => {
      const aValidButNonExistentAmendmentId = new ObjectId().toString();

      const { status, body } = (await testApi.get(generateUrl(facilityId, aValidButNonExistentAmendmentId))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.NotFound);
      expect(body).toEqual({
        status: HttpStatusCode.NotFound,
        message: `Amendment not found: ${aValidButNonExistentAmendmentId} on facility: ${facilityId}`,
      });
    });

    it('should return the amendment when it exists', async () => {
      const { status, body } = (await testApi.get(generateUrl(facilityId, amendmentId))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body).toEqual(
        expect.objectContaining({
          amendmentId,
          dealId,
          facilityId,
          type: AMENDMENT_TYPES.PORTAL,
        } as AnyObject),
      );
    });
  });
});
