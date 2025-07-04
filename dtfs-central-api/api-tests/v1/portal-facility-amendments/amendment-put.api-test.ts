import { Response } from 'supertest';
import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import {
  AnyObject,
  API_ERROR_CODE,
  DEAL_SUBMISSION_TYPE,
  DEAL_TYPE,
  FACILITY_TYPE,
  MONGO_DB_COLLECTIONS,
  PORTAL_AMENDMENT_STATUS,
  PortalFacilityAmendment,
} from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalFacilityAmendment, aPortalFacilityAmendmentUserValues } from '@ukef/dtfs2-common/mock-data-backend';
import wipeDB from '../../wipeDB';
import { testApi } from '../../test-api';
import { createDeal, submitDealToTfm } from '../../helpers/create-deal';
import aDeal from '../deal-builder';
import { aPortalUser } from '../../mocks/test-users/portal-user';
import { createPortalUser } from '../../helpers/create-portal-user';
import { createPortalFacilityAmendment } from '../../helpers/create-portal-facility-amendment';
import { amendmentsEligibilityCriteria } from '../../../test-helpers/test-data/eligibility-criteria-amendments';
import { mongoDbClient as db } from '../../../src/drivers/db-client';
import { aTfmFacility, aTfmFacilityAmendment } from '../../../test-helpers';

const originalEnv = { ...process.env };

interface FacilityAmendmentResponse extends Response {
  body: PortalFacilityAmendment;
}

const generateUrl = (facilityId: string): string => {
  return `/v1/portal/facilities/${facilityId}/amendments/`;
};

console.error = jest.fn();

const newDeal = aDeal({
  dealType: DEAL_TYPE.GEF,
  submissionType: DEAL_SUBMISSION_TYPE.AIN,
}) as AnyObject;

const draftCashEligibilityCriteria = amendmentsEligibilityCriteria(1.5, [FACILITY_TYPE.CASH, FACILITY_TYPE.CONTINGENT], true);
const latestCashEligibilityCriteria = amendmentsEligibilityCriteria(1.2, [FACILITY_TYPE.CASH, FACILITY_TYPE.CONTINGENT]);
const legacyCashEligibilityCriteria = amendmentsEligibilityCriteria(1, [FACILITY_TYPE.CASH, FACILITY_TYPE.CONTINGENT]);
const otherEligibilityCriteria = amendmentsEligibilityCriteria(2, [FACILITY_TYPE.LOAN]);

const eligibilityCriteriaList = [draftCashEligibilityCriteria, legacyCashEligibilityCriteria, latestCashEligibilityCriteria, otherEligibilityCriteria];

const aReadyForApprovalPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL });
const aDraftPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.DRAFT });
const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED });
const aTfmAmendment = aTfmFacilityAmendment();

describe('PUT /v1/portal/facilities/:facilityId/amendments/', () => {
  let dealId: string;
  let facilityId: string;

  let portalUserId: string;

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.TFM_FACILITIES, MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA_AMENDMENTS]);
    await db.getCollection(MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA_AMENDMENTS).then((collection) => collection.insertMany(eligibilityCriteriaList));

    portalUserId = (await createPortalUser())._id;
  });

  beforeEach(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.TFM_FACILITIES]);

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
      const { status } = (await testApi
        .put({ dealId, amendment: aPortalFacilityAmendmentUserValues(), auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(facilityId))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.NotFound);
    });
  });

  describe('when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is set to `true`', () => {
    beforeAll(() => {
      process.env.FF_PORTAL_FACILITY_AMENDMENTS_ENABLED = 'true';
    });

    it(`should return ${HttpStatusCode.BadRequest} when the facility id is invalid`, async () => {
      const anInvalidFacilityId = 'InvalidId';

      const { body, status } = (await testApi
        .put({ dealId, amendment: aPortalFacilityAmendmentUserValues(), auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(anInvalidFacilityId))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.BadRequest);

      expect(body).toEqual({
        message: "Expected path parameter 'facilityId' to be a valid mongo id",
        code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
      });
    });

    it(`should return ${HttpStatusCode.NotFound} when the facility does not exist`, async () => {
      const aValidButNonExistentFacilityId = new ObjectId().toString();

      const { body, status } = (await testApi
        .put({ dealId, amendment: aPortalFacilityAmendmentUserValues(), auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(aValidButNonExistentFacilityId))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.NotFound);
      expect(body).toEqual({
        status: HttpStatusCode.NotFound,
        message: `Facility not found: ${aValidButNonExistentFacilityId}`,
      });
    });

    it(`should return ${HttpStatusCode.BadRequest} when the payload has extra fields`, async () => {
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

    it(`should return ${HttpStatusCode.Conflict} when there is an existing amendment in progress on the facility`, async () => {
      // Arrange
      const facility = aTfmFacility({ amendments: [], dealId });
      // create facility
      const response = await db.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES).then((collection) => collection.insertOne(facility));

      const amendment = aReadyForApprovalPortalAmendment;
      // set the facilityId on the amendment as created facility's
      amendment.facilityId = response.insertedId;

      // update the facility with the amendment
      await db
        .getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES)
        .then((collection) => collection.updateOne({ _id: amendment.facilityId }, { $push: { amendments: amendment } }));

      // Act
      const { body, status } = (await testApi
        .put({ dealId, amendment: aPortalFacilityAmendmentUserValues(), auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(amendment.facilityId.toString()))) as FacilityAmendmentResponse;

      // Assert
      expect(status).toEqual(HttpStatusCode.Conflict);
      expect(body).toEqual({
        status: HttpStatusCode.Conflict,
        message: `There is already a portal facility amendment in progress for the given facility ${amendment.facilityId.toString()}`,
      });
    });

    const validExistingAmendments = [
      { description: PORTAL_AMENDMENT_STATUS.DRAFT, amendment: aDraftPortalAmendment },
      { description: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED, amendment: anAcknowledgedPortalAmendment },
      { description: 'TFM', amendment: aTfmAmendment },
    ];

    it.each(validExistingAmendments)('should not throw an error when there is an existing `$description` amendment', async ({ amendment }) => {
      // Arrange
      const facilityWithAmendment = aTfmFacility({
        amendments: [amendment],
        dealId,
      });
      await db.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES).then((collection) => collection.insertOne(facilityWithAmendment));

      // Act
      const { status } = (await testApi
        .put({ dealId, amendment: aPortalFacilityAmendmentUserValues(), auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(facilityId))) as FacilityAmendmentResponse;

      // Assert
      expect(status).toEqual(HttpStatusCode.Ok);
    });

    it('should return the new amendment', async () => {
      // Act
      const { body, status } = (await testApi
        .put({ dealId, amendment: aPortalFacilityAmendmentUserValues(), auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(facilityId))) as FacilityAmendmentResponse;

      // Assert
      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body).toEqual(
        expect.objectContaining({
          amendmentId: expect.any(String) as string,
          facilityId,
          dealId,
        }),
      );
    });

    it('should overwrite any existing amendment', async () => {
      // Arrange
      const existingAmendment = await createPortalFacilityAmendment({ facilityId, dealId, userId: portalUserId });
      const existingAmendmentId = existingAmendment.amendmentId.toString();

      // Act
      const { status } = (await testApi
        .put({ dealId, amendment: aPortalFacilityAmendmentUserValues(), auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(facilityId))) as FacilityAmendmentResponse;

      expect(status).toEqual(HttpStatusCode.Ok);

      // Assert
      const getExistingAmendmentResponse = (await testApi.get(
        `/v1/portal/facilities/${facilityId}/amendments/${existingAmendmentId}`,
      )) as FacilityAmendmentResponse;

      expect(getExistingAmendmentResponse.status).toEqual(HttpStatusCode.NotFound);
      expect(getExistingAmendmentResponse.body).toEqual({
        status: HttpStatusCode.NotFound,
        message: `Amendment not found: ${existingAmendmentId} on facility: ${facilityId}`,
      });
    });

    it('should return the new amendment with the latest non-draft eligibility criteria for the facility type', async () => {
      // Act
      const { body, status } = (await testApi
        .put({ dealId, amendment: aPortalFacilityAmendmentUserValues(), auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(facilityId))) as FacilityAmendmentResponse;

      // Assert
      const latestCriteriaForFacilityType = latestCashEligibilityCriteria.criteria.map((criterion) => ({ ...criterion, answer: null }));
      const latestVersionForFacilityType = latestCashEligibilityCriteria.version;

      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body).toEqual(
        expect.objectContaining({
          amendmentId: expect.any(String) as string,
          facilityId,
          dealId,
          eligibilityCriteria: { version: latestVersionForFacilityType, criteria: latestCriteriaForFacilityType },
        }),
      );
    });

    it('should throw an error if no eligibility criteria exists in the db for the given facility type', async () => {
      // Arrange
      await wipeDB.wipe([MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA_AMENDMENTS]);
      const eligibilityCriteriaNoCash = [
        amendmentsEligibilityCriteria(1, [FACILITY_TYPE.CONTINGENT]),
        amendmentsEligibilityCriteria(2, [FACILITY_TYPE.CASH], true),
        amendmentsEligibilityCriteria(1.5, [FACILITY_TYPE.BOND, FACILITY_TYPE.LOAN]),
      ];
      await db.getCollection(MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA_AMENDMENTS).then((c) => c.insertMany(eligibilityCriteriaNoCash));

      // Act
      const { body, status } = (await testApi
        .put({ dealId, amendment: aPortalFacilityAmendmentUserValues(), auditDetails: generatePortalAuditDetails(portalUserId) })
        .to(generateUrl(facilityId))) as FacilityAmendmentResponse;

      // Assert
      expect(status).toEqual(HttpStatusCode.NotFound);
      expect(body).toEqual({
        status: HttpStatusCode.NotFound,
        message: 'Eligibility criteria not found',
      });
      expect(console.error).toHaveBeenCalledWith('Unable to find latest eligibility criteria for facility type %s', FACILITY_TYPE.CASH);
    });
  });
});
