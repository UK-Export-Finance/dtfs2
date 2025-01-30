import { Response } from 'supertest';
import { HttpStatusCode } from 'axios';
import { API_ERROR_CODE, MONGO_DB_COLLECTIONS, PORTAL_AMENDMENT_STATUS, PortalFacilityAmendment, TfmFacility } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { ObjectId } from 'mongodb';
import wipeDB from '../../wipeDB';
import { testApi } from '../../test-api';
import { mongoDbClient as db } from '../../../src/drivers/db-client';
import { aCompletedTfmFacilityAmendment, aTfmFacility, aTfmFacilityAmendment } from '../../../test-helpers';

interface PortalAmendmentsResponse extends Response {
  body: PortalFacilityAmendment[];
}

const generateUrl = (dealId: string): string => {
  return `/v1/portal/deals/${dealId}/amendments`;
};

describe('GET /v1/portal/deals/:dealId/amendments', () => {
  const dealId = new ObjectId().toString();

  const aDraftPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.DRAFT });
  const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED });
  const aReadyForApprovalPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.READY_FOR_APPROVAL });
  const aChangesRequiredPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.CHANGES_REQUIRED });

  const aTfmAmendment = aTfmFacilityAmendment();
  const aCompletedTfmAmendment = aCompletedTfmFacilityAmendment();

  const facilityWithNoAmendments: TfmFacility = aTfmFacility({ amendments: [], dealId });
  const facilityWithATfmAmendment: TfmFacility = aTfmFacility({ amendments: [aTfmAmendment], dealId });
  const facilityWithPortalAmendments: TfmFacility = aTfmFacility({ amendments: [aDraftPortalAmendment, anAcknowledgedPortalAmendment], dealId });
  const facilityWithMixedAmendments: TfmFacility = aTfmFacility({ amendments: [aReadyForApprovalPortalAmendment, aCompletedTfmAmendment], dealId });

  const facilityWithPortalAmendmentsOnDifferentDeal: TfmFacility = aTfmFacility({
    amendments: [aDraftPortalAmendment, aChangesRequiredPortalAmendment],
    dealId: new ObjectId(),
  });

  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
  });

  afterEach(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.TFM_FACILITIES]);
  });

  it(`should return ${HttpStatusCode.BadRequest} when the deal Id is invalid`, async () => {
    // Arrange
    const anInvalidDealId = 'InvalidId';

    // Act
    const { status, body } = (await testApi.get(generateUrl(anInvalidDealId))) as PortalAmendmentsResponse;

    // Assert
    expect(status).toEqual(HttpStatusCode.BadRequest);
    expect(body).toEqual({
      message: "Expected path parameter 'dealId' to be a valid mongo id",
      code: API_ERROR_CODE.INVALID_MONGO_ID_PATH_PARAMETER,
    });
  });

  it(`should return an empty array when there are no portal amendments with the given deal Id`, async () => {
    // Arrange
    await db
      .getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES)
      .then((collection) => collection.insertMany([facilityWithATfmAmendment, facilityWithNoAmendments, facilityWithPortalAmendmentsOnDifferentDeal]));

    // Assert
    const { status, body } = (await testApi.get(generateUrl(dealId))) as PortalAmendmentsResponse;

    // Act
    expect(status).toEqual(HttpStatusCode.Ok);
    expect(body).toEqual([]);
  });

  it(`should return just the portal amendments matching the given deal`, async () => {
    // Arrange
    await db
      .getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES)
      .then((collection) =>
        collection.insertMany([
          facilityWithATfmAmendment,
          facilityWithNoAmendments,
          facilityWithPortalAmendments,
          facilityWithMixedAmendments,
          facilityWithPortalAmendmentsOnDifferentDeal,
        ]),
      );

    // Assert
    const { status, body } = (await testApi.get(generateUrl(dealId))) as PortalAmendmentsResponse;

    // Act
    expect(status).toEqual(HttpStatusCode.Ok);

    const expectedAmendmentIds = [
      aDraftPortalAmendment.amendmentId.toString(),
      anAcknowledgedPortalAmendment.amendmentId.toString(),
      aReadyForApprovalPortalAmendment.amendmentId.toString(),
    ];
    expect(body.map((amendment) => amendment.amendmentId)).toEqual(expectedAmendmentIds);
  });
});
