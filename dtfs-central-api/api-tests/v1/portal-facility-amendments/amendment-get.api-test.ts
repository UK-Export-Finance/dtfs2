import { Response } from 'supertest';
import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { AnyObject, API_ERROR_CODE, DEAL_SUBMISSION_TYPE, DEAL_TYPE, FACILITY_TYPE, MONGO_DB_COLLECTIONS, PortalFacilityAmendment } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import wipeDB from '../../wipeDB';
import { testApi } from '../../test-api';
import { createDeal } from '../../helpers/create-deal';
import { MOCK_PORTAL_USER } from '../../mocks/test-users/mock-portal-user';
import aDeal from '../deal-builder';
import { aPortalUser } from '../../mocks/test-users/portal-user';

const originalEnv = { ...process.env };

interface FacilityAmendmentResponse extends Response {
  body: PortalFacilityAmendment;
}

const generateUrl = (facilityId: string, amendmentId: string): string => {
  return `/v1/portal/gef/facilities/${facilityId}/amendments/${amendmentId}`;
};

const newDeal = aDeal({
  dealType: DEAL_TYPE.GEF,
  submissionType: DEAL_SUBMISSION_TYPE.AIN,
}) as AnyObject;

describe('/v1/portal/facilities/:facilityId/amendments/:amendmentId', () => {
  let dealId;
  let amendmentId: string;
  let facilityId: string;

  beforeEach(async () => {
    const createDealResponse: { body: { _id: string } } = await createDeal({ deal: newDeal, user: aPortalUser() });
    dealId = createDealResponse.body._id;

    const createFacilityResponse: { body: { _id: string } } = await testApi
      .post({ dealId, type: FACILITY_TYPE.CASH, hasBeenIssued: false })
      .to('/v1/portal/gef/facilities');

    facilityId = createFacilityResponse.body._id;

    await testApi
      .put({
        dealType: DEAL_TYPE.GEF,
        dealId,
        submissionType: DEAL_SUBMISSION_TYPE.AIN,
        auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
      })
      .to('/v1/tfm/deals/submit');

    // TODO: DTFS2-7674 - use PUT to insert an amendment
    amendmentId = new ObjectId().toString();
  });

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('with FF_PORTAL_FACILITY_AMENDMENTS_ENABLED set to `false`', () => {
    beforeAll(() => {
      process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'false';
    });

    it('returns 404 when the amendment does not exist', async () => {
      const { status } = await testApi.get<FacilityAmendmentResponse>(generateUrl(facilityId, amendmentId));

      expect(status).toEqual(HttpStatusCode.NotFound);
    });
  });

  describe('GET /v1/portal/facilities/:facilityId/amendments/:amendmentId', () => {
    describe('with FF_PORTAL_FACILITY_AMENDMENTS_ENABLED set to `true`', () => {
      beforeAll(() => {
        process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'true';
      });

      it('returns 400 when the facility id is invalid', async () => {
        const anInvalidFacilityId = 'InvalidId';

        const { status, body } = await testApi.get<FacilityAmendmentResponse>(generateUrl(anInvalidFacilityId, amendmentId));

        expect(status).toEqual(HttpStatusCode.BadRequest);

        expect(body).toEqual({
          message: "Expected path parameter 'facilityId' to be a valid mongo id",
          code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
        });
      });

      it('returns 400 when the amendment id is invalid', async () => {
        const anInvalidAmendmentId = 'InvalidId';

        const { status, body } = await testApi.get<FacilityAmendmentResponse>(generateUrl(facilityId, anInvalidAmendmentId));

        expect(status).toEqual(HttpStatusCode.BadRequest);

        expect(body).toEqual({
          message: "Expected path parameter 'amendmentId' to be a valid mongo id",
          code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
        });
      });

      it('returns 404 when the facility does not exist', async () => {
        const aValidButNonExistentFacilityId = new ObjectId().toString();

        const { status, body } = await testApi.get<FacilityAmendmentResponse>(generateUrl(aValidButNonExistentFacilityId, amendmentId));

        expect(status).toEqual(HttpStatusCode.NotFound);
        expect(body).toEqual({
          status: HttpStatusCode.NotFound,
          message: `Facility not found: ${aValidButNonExistentFacilityId}`,
        });
      });

      it('returns 404 when the amendment does not exist', async () => {
        const aValidButNonExistentAmendmentId = new ObjectId().toString();

        const { status, body } = await testApi.get<FacilityAmendmentResponse>(generateUrl(facilityId, aValidButNonExistentAmendmentId));

        expect(status).toEqual(HttpStatusCode.NotFound);
        expect(body).toEqual({
          status: HttpStatusCode.NotFound,
          message: `Amendment not found: ${aValidButNonExistentAmendmentId}`,
        });
      });

      // TODO: DTFS2-7674 - add success tests after making a PUT request
    });
  });
});
