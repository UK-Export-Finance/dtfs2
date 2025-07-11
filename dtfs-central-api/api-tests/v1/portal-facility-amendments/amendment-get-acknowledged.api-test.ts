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
  PORTAL_AMENDMENT_STATUS,
  portalAmendmentToUkefEmailVariables,
} from '@ukef/dtfs2-common';
import { aPortalFacilityAmendmentUserValues } from '@ukef/dtfs2-common/mock-data-backend';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';

import wipeDB from '../../wipeDB';
import { testApi } from '../../test-api';
import { createDeal, submitDealToTfm } from '../../helpers/create-deal';
import aDeal from '../deal-builder';
import { aPortalUser } from '../../mocks/test-users/portal-user';
import { createPortalUser } from '../../helpers/create-portal-user';
import { createPortalFacilityAmendment } from '../../helpers/create-portal-facility-amendment';
import { mongoDbClient as db } from '../../../src/drivers/db-client';
import { amendmentsEligibilityCriteria } from '../../../test-helpers/test-data/eligibility-criteria-amendments';

const originalEnv = { ...process.env };

const bankId = '1';
const bankName = 'Bank Name';

interface FacilityAmendmentResponse extends Response {
  body: PortalFacilityAmendment;
}

const generateUrl = (facilityId: string): string => {
  return `/v1/portal/facilities/${facilityId}/amendments/acknowledged`;
};

const generateSubmitAmendmentUrl = (facilityId: string, amendmentId: string): string => {
  return `/v1/portal/facilities/${facilityId}/amendments/${amendmentId}/submit-amendment`;
};

const newDeal = aDeal({
  dealType: DEAL_TYPE.GEF,
  submissionType: DEAL_SUBMISSION_TYPE.AIN,
}) as AnyObject;

describe('GET /v1/portal/facilities/:facilityId/amendments/acknowledged', () => {
  let dealId: string;
  let facilityId: string;
  let portalUserId: string;
  let referenceNumber: string;

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
    referenceNumber = '123456-023';

    await submitDealToTfm({ dealId, dealSubmissionType: DEAL_SUBMISSION_TYPE.AIN, dealType: DEAL_TYPE.GEF });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('with FF_PORTAL_FACILITY_AMENDMENTS_ENABLED set to `false`', () => {
    beforeAll(() => {
      process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'false';
    });

    it(`should return ${HttpStatusCode.NotFound}`, async () => {
      const { status } = (await testApi.get(generateUrl(facilityId))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.NotFound);
    });
  });

  describe('with FF_PORTAL_FACILITY_AMENDMENTS_ENABLED set to `true`', () => {
    let amendmentId: string;

    beforeEach(async () => {
      const existingAmendment = await createPortalFacilityAmendment({
        facilityId,
        dealId,
        userId: portalUserId,
        amendment: {
          ...aPortalFacilityAmendmentUserValues(),
          eligibilityCriteria: {
            criteria: [{ id: 1, text: 'item 1', answer: true }],
            version: 1,
          },
        },
        status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
      });

      // create second amendment with status which is not acknowledged
      await createPortalFacilityAmendment({
        facilityId,
        dealId,
        userId: portalUserId,
        amendment: {
          ...aPortalFacilityAmendmentUserValues(),
          eligibilityCriteria: {
            criteria: [{ id: 1, text: 'item 1', answer: true }],
            version: 1,
          },
        },
        status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
      });

      amendmentId = existingAmendment.amendmentId.toString();

      const newStatus = PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED;

      // submit amendment to make it acknowledged
      await testApi
        .patch({
          auditDetails: generatePortalAuditDetails(portalUserId),
          newStatus,
          referenceNumber,
          ...portalAmendmentToUkefEmailVariables(),
          bankId,
          bankName,
        })
        .to(generateSubmitAmendmentUrl(facilityId, amendmentId));
    });

    beforeAll(() => {
      process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'true';
    });

    it(`should return ${HttpStatusCode.BadRequest} when the facility id is invalid`, async () => {
      const anInvalidFacilityId = 'InvalidId';

      const { status, body } = (await testApi.get(generateUrl(anInvalidFacilityId))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.BadRequest);

      expect(body).toEqual({
        message: "Expected path parameter 'facilityId' to be a valid mongo id",
        code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
      });
    });

    it(`should an empty array when the facility does not exist`, async () => {
      const aValidButNonExistentFacilityId = new ObjectId().toString();

      const { status, body } = (await testApi.get(generateUrl(aValidButNonExistentFacilityId))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body).toEqual([]);
    });

    it(`should return one amendment only which has status ${PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED}`, async () => {
      const { status, body } = (await testApi.get(generateUrl(facilityId))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.Ok);

      expect(body).toHaveLength(1);

      expect(body).toEqual([
        expect.objectContaining({
          amendmentId,
          dealId,
          facilityId,
          type: AMENDMENT_TYPES.PORTAL,
        } as AnyObject),
      ]);
    });
  });
});
