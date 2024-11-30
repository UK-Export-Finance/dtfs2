import { Response } from 'supertest';
import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { MONGO_DB_COLLECTIONS, PortalFacilityAmendment } from '@ukef/dtfs2-common';
import wipeDB from '../../wipeDB';
import { testApi } from '../../test-api';

const originalEnv = { ...process.env };

interface FacilityAmendmentResponse extends Response {
  body: PortalFacilityAmendment;
}

const generateUrl = (facilityId: string, amendmentId: string): string => {
  return `/v1/portal/gef/facilities/${facilityId}/amendments/${amendmentId}`;
};

describe('/v1/portal/facilities/:facilityId/amendments/:amendmentId', () => {
  const amendmentId = new ObjectId().toString();
  const facilityId = new ObjectId().toString();

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

        const { status } = await testApi.get<FacilityAmendmentResponse>(generateUrl(anInvalidFacilityId, amendmentId));

        expect(status).toEqual(HttpStatusCode.BadRequest);
      });

      it('returns 400 when the amendment id is invalid', async () => {
        const anInvalidAmendmentId = 'InvalidId';

        const { status } = await testApi.get<FacilityAmendmentResponse>(generateUrl(facilityId, anInvalidAmendmentId));

        expect(status).toEqual(HttpStatusCode.BadRequest);
      });

      it('returns 404 when the facility does not exist', async () => {
        const aValidButNonExistentFacilityId = new ObjectId().toString();

        const { status } = await testApi.get<FacilityAmendmentResponse>(generateUrl(aValidButNonExistentFacilityId, amendmentId));

        expect(status).toEqual(HttpStatusCode.NotFound);
      });

      it('returns 404 when the amendment does not exist', async () => {
        const aValidButNonExistentAmendmentId = new ObjectId().toString();

        const { status } = await testApi.get<FacilityAmendmentResponse>(generateUrl(facilityId, aValidButNonExistentAmendmentId));

        expect(status).toEqual(HttpStatusCode.NotFound);
      });
    });
  });
});
