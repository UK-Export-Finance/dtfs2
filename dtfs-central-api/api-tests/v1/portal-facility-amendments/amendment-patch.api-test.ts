import { Response } from 'supertest';
import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { AnyObject, API_ERROR_CODE, DEAL_SUBMISSION_TYPE, DEAL_TYPE, FACILITY_TYPE, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalFacilityAmendmentUserValues } from '@ukef/dtfs2-common/mock-data-backend';
import wipeDB from '../../wipeDB';
import { testApi } from '../../test-api';
import { createDeal, submitDealToTfm } from '../../helpers/create-deal';
import aDeal from '../deal-builder';
import { aPortalUser } from '../../mocks/test-users/portal-user';
import { createPortalUser } from '../../helpers/create-portal-user';
import { createPortalFacilityAmendment } from '../../helpers/create-portal-facility-amendment';
import { mongoDbClient as db } from '../../../server/drivers/db-client';
import { amendmentsEligibilityCriteria } from '../../../test-helpers/test-data/eligibility-criteria-amendments';

const originalEnv = { ...process.env };

interface ErrorResponse extends Response {
  body: { status?: number; message: string; code?: string };
}

const generateUrl = (facilityId: string, amendmentId: string): string => {
  return `/v1/portal/facilities/${facilityId}/amendments/${amendmentId}`;
};

const newDeal = aDeal({
  dealType: DEAL_TYPE.GEF,
  submissionType: DEAL_SUBMISSION_TYPE.AIN,
}) as AnyObject;

describe('PATCH /v1/portal/facilities/:facilityId/amendments/:amendmentId', () => {
  let dealId: string;
  let facilityId: string;
  let portalUserId: string;

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.TFM_FACILITIES, MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA_AMENDMENTS]);
    await db
      .getCollection(MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA_AMENDMENTS)
      .then((collection) => collection.insertOne(amendmentsEligibilityCriteria(1, [FACILITY_TYPE.CASH, FACILITY_TYPE.CONTINGENT])));

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

    it(`should return ${HttpStatusCode.NotFound}`, async () => {
      const amendmentId = new ObjectId().toString();

      const { status } = await testApi
        .patch({ update: aPortalFacilityAmendmentUserValues(), auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(facilityId, amendmentId));

      expect(status).toEqual(HttpStatusCode.NotFound);
    });
  });

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is set to `true`', () => {
    let amendmentId: string;

    beforeAll(() => {
      process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'true';
    });

    beforeEach(async () => {
      const existingAmendment = await createPortalFacilityAmendment({ facilityId, dealId, userId: portalUserId });

      amendmentId = existingAmendment.amendmentId.toString();
    });

    it(`should return ${HttpStatusCode.BadRequest} when the facility id is invalid`, async () => {
      const anInvalidFacilityId = 'InvalidId';

      const { body, status } = (await testApi
        .patch({ update: aPortalFacilityAmendmentUserValues(), auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(anInvalidFacilityId, amendmentId))) as ErrorResponse;

      expect(status).toEqual(HttpStatusCode.BadRequest);

      expect(body).toEqual({
        message: "Expected path parameter 'facilityId' to be a valid mongo id",
        code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
      });
    });

    it(`should return ${HttpStatusCode.BadRequest} when the amendment id is invalid`, async () => {
      const anInvalidAmendmentId = 'InvalidId';

      const { body, status } = (await testApi
        .patch({ update: aPortalFacilityAmendmentUserValues(), auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(facilityId, anInvalidAmendmentId))) as ErrorResponse;

      expect(status).toEqual(HttpStatusCode.BadRequest);

      expect(body).toEqual({
        message: "Expected path parameter 'amendmentId' to be a valid mongo id",
        code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
      });
    });

    it(`should return ${HttpStatusCode.BadRequest} when the update has extra fields`, async () => {
      const { body, status } = (await testApi
        .patch({
          update: { ...(aPortalFacilityAmendmentUserValues() as AnyObject), additional: 'property' },
          auditDetails: generatePortalAuditDetails(portalUserId),
        })
        .to(generateUrl(facilityId, amendmentId))) as ErrorResponse;

      expect(status).toEqual(HttpStatusCode.BadRequest);
      expect(body).toEqual({
        status: HttpStatusCode.BadRequest,
        message: ["update: Unrecognized key(s) in object: 'additional' (unrecognized_keys)"],
        code: API_ERROR_CODE.INVALID_PAYLOAD,
      });
    });

    it(`should return ${HttpStatusCode.NotFound} when the facility does not exist`, async () => {
      const aValidButNonExistentFacilityId = new ObjectId().toString();

      const { body, status } = (await testApi
        .patch({ update: aPortalFacilityAmendmentUserValues(), auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(aValidButNonExistentFacilityId, amendmentId))) as ErrorResponse;

      expect(status).toEqual(HttpStatusCode.NotFound);
      expect(body).toEqual({
        status: HttpStatusCode.NotFound,
        message: `Amendment not found: ${amendmentId} on facility: ${aValidButNonExistentFacilityId}`,
      });
    });

    it(`should return ${HttpStatusCode.NotFound} when the amendment does not exist`, async () => {
      const aValidButNonExistentAmendmentId = new ObjectId().toString();

      const { body, status } = (await testApi
        .patch({ update: aPortalFacilityAmendmentUserValues(), auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(facilityId, aValidButNonExistentAmendmentId))) as ErrorResponse;

      expect(status).toEqual(HttpStatusCode.NotFound);
      expect(body).toEqual({
        status: HttpStatusCode.NotFound,
        message: `Amendment not found: ${aValidButNonExistentAmendmentId} on facility: ${facilityId}`,
      });
    });

    it(`should return ${HttpStatusCode.Ok} when the payload is valid & the amendment exists`, async () => {
      const { status } = await testApi
        .patch({ update: aPortalFacilityAmendmentUserValues(), auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(facilityId, amendmentId));

      expect(status).toEqual(HttpStatusCode.Ok);
    });
  });
});
