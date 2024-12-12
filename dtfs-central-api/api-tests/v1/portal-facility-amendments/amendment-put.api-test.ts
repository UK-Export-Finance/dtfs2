import { Response } from 'supertest';
import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { AnyObject, API_ERROR_CODE, DEAL_SUBMISSION_TYPE, DEAL_TYPE, FACILITY_TYPE, MONGO_DB_COLLECTIONS, PortalFacilityAmendment } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
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

const generateUrl = (facilityId: string): string => {
  return `/v1/portal/facilities/${facilityId}/amendments/`;
};

const newDeal = aDeal({
  dealType: DEAL_TYPE.GEF,
  submissionType: DEAL_SUBMISSION_TYPE.AIN,
}) as AnyObject;

describe('PUT /v1/portal/facilities/:facilityId/amendments/', () => {
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

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is set to `false`', () => {
    beforeAll(() => {
      process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'false';
    });

    it('should return 404', async () => {
      const { status } = (await testApi
        .put({ dealId, amendment: {}, auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(facilityId))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.NotFound);
    });
  });

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is set to `true`', () => {
    beforeAll(() => {
      process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'true';
    });

    it('should return 400 when the facility id is invalid', async () => {
      const anInvalidFacilityId = 'InvalidId';

      const { body, status } = (await testApi
        .put({ dealId, amendment: {}, auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(anInvalidFacilityId))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.BadRequest);

      expect(body).toEqual({
        message: "Expected path parameter 'facilityId' to be a valid mongo id",
        code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
      });
    });

    it('should return 404 when the facility does not exist', async () => {
      const aValidButNonExistentFacilityId = new ObjectId().toString();

      const { body, status } = (await testApi
        .put({ dealId, amendment: {}, auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(aValidButNonExistentFacilityId))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.NotFound);
      expect(body).toEqual({
        status: HttpStatusCode.NotFound,
        message: `Facility not found: ${aValidButNonExistentFacilityId}`,
      });
    });

    it('should return 400 when the payload has extra fields', async () => {
      const { body, status } = (await testApi
        .put({ dealId, amendment: { extraField: 'This field should not exist' }, auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(facilityId))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.BadRequest);
      expect(body).toEqual({
        status: HttpStatusCode.BadRequest,
        message: ["amendment: Unrecognized key(s) in object: 'extraField' (unrecognized_keys)"],
        code: API_ERROR_CODE.INVALID_PAYLOAD,
      });
    });

    it('should return the new amendment', async () => {
      // Act
      const { body, status } = (await testApi
        .put({ dealId, amendment: {}, auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(facilityId))) as FacilityAmendmentResponse;

      // Assert
      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body).toEqual(expect.objectContaining({ amendmentId: expect.any(String) as string, facilityId, dealId }));
    });

    it('should overwrite any existing amendment', async () => {
      // Arrange
      const existingAmendment = await createPortalFacilityAmendment({ facilityId, dealId, userId: portalUserId });
      const existingAmendmentId = existingAmendment.amendmentId.toString();

      // Act
      const { status } = (await testApi
        .put({ dealId, amendment: {}, auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(facilityId))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.Ok);

      // Assert
      const getExistingAmendmentResponse = (await testApi.get(
        `/v1/portal/facilities/${facilityId}/amendments/${existingAmendmentId}`,
      )) as FacilityAmendmentResponse;

      expect(getExistingAmendmentResponse.status).toEqual(HttpStatusCode.NotFound);
      expect(getExistingAmendmentResponse.body).toEqual({
        status: HttpStatusCode.NotFound,
        message: `Amendment not found: ${existingAmendmentId}`,
      });
    });
  });
});
