import { Response } from 'supertest';
import { HttpStatusCode } from 'axios';
import { API_ERROR_CODE, MONGO_DB_COLLECTIONS, PORTAL_AMENDMENT_STATUS, PortalAmendmentStatus, PortalFacilityAmendment, TfmFacility } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { ObjectId } from 'mongodb';
import wipeDB from '../../wipeDB';
import { testApi } from '../../test-api';
import { mongoDbClient as db } from '../../../src/drivers/db-client';
import { aCompletedTfmFacilityAmendment, aTfmFacility, aTfmFacilityAmendment } from '../../../test-helpers';

interface PortalAmendmentsResponse extends Response {
  body: PortalFacilityAmendment[];
}

const generateUrl = ({ dealId, statuses }: { dealId: string; statuses?: PortalAmendmentStatus[] }): string => {
  const statusFilterQuery = statuses ? `?statusFilter=${statuses.map((item) => item.replace(/ /g, '%20')).join(',')}` : '';
  return `/v1/portal/deals/${dealId}/amendments${statusFilterQuery}`;
};

describe('GET /v1/portal/deals/:dealId/amendments', () => {
  const dealId = new ObjectId().toString();

  const aDraftPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.DRAFT });
  const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED });
  const aReadyForCheckersApprovalPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL });
  const aFurtherMakersInputRequiredPortalAmendment = aPortalFacilityAmendment({ status: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED });

  const aTfmAmendment = aTfmFacilityAmendment();
  const aCompletedTfmAmendment = aCompletedTfmFacilityAmendment();

  const facilityWithNoAmendments: TfmFacility = aTfmFacility({ amendments: [], dealId });
  const facilityWithATfmAmendment: TfmFacility = aTfmFacility({ amendments: [aTfmAmendment], dealId });
  const facilityWithDraftAndAcknowledgedAmendments: TfmFacility = aTfmFacility({ amendments: [aDraftPortalAmendment, anAcknowledgedPortalAmendment], dealId });
  const facilityWithReadyForCheckersApprovalAndTfmAmendments: TfmFacility = aTfmFacility({
    amendments: [aReadyForCheckersApprovalPortalAmendment, aCompletedTfmAmendment],
    dealId,
  });

  const facilityWithPortalAmendmentsOnDifferentDeal: TfmFacility = aTfmFacility({
    amendments: [aDraftPortalAmendment, aFurtherMakersInputRequiredPortalAmendment],
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
    const { status, body } = (await testApi.get(generateUrl({ dealId: anInvalidDealId }))) as PortalAmendmentsResponse;

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
    const { status, body } = (await testApi.get(generateUrl({ dealId }))) as PortalAmendmentsResponse;

    // Act
    expect(status).toEqual(HttpStatusCode.Ok);
    expect(body).toEqual([]);
  });

  it(`should return an empty array when there are no portal amendments with the given deal Id or requested statuses`, async () => {
    // Arrange
    await db
      .getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES)
      .then((collection) =>
        collection.insertMany([facilityWithATfmAmendment, facilityWithReadyForCheckersApprovalAndTfmAmendments, facilityWithDraftAndAcknowledgedAmendments]),
      );

    // Assert
    const { status, body } = (await testApi.get(
      generateUrl({ dealId, statuses: [PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED] }),
    )) as PortalAmendmentsResponse;

    // Act
    expect(status).toEqual(HttpStatusCode.Ok);
    expect(body).toEqual([]);
  });

  it(`should return all the portal amendments with the given deal Id when no statuses are provided`, async () => {
    // Arrange
    await db
      .getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES)
      .then((collection) =>
        collection.insertMany([
          facilityWithATfmAmendment,
          facilityWithNoAmendments,
          facilityWithDraftAndAcknowledgedAmendments,
          facilityWithReadyForCheckersApprovalAndTfmAmendments,
          facilityWithPortalAmendmentsOnDifferentDeal,
        ]),
      );

    // Assert
    const { status, body } = (await testApi.get(generateUrl({ dealId }))) as PortalAmendmentsResponse;

    // Act
    expect(status).toEqual(HttpStatusCode.Ok);

    const expectedAmendmentIds = [
      aDraftPortalAmendment.amendmentId.toString(),
      anAcknowledgedPortalAmendment.amendmentId.toString(),
      aReadyForCheckersApprovalPortalAmendment.amendmentId.toString(),
    ];
    expect(body.map((amendment) => amendment.amendmentId)).toEqual(expectedAmendmentIds);
  });

  it(`should return the portal amendments on the deal matching the provided statuses`, async () => {
    // Arrange
    await db
      .getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES)
      .then((collection) =>
        collection.insertMany([
          facilityWithDraftAndAcknowledgedAmendments,
          facilityWithReadyForCheckersApprovalAndTfmAmendments,
          facilityWithPortalAmendmentsOnDifferentDeal,
        ]),
      );

    // Assert
    const { status, body } = (await testApi.get(
      generateUrl({ dealId, statuses: [PORTAL_AMENDMENT_STATUS.DRAFT, PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL] }),
    )) as PortalAmendmentsResponse;

    // Act
    expect(status).toEqual(HttpStatusCode.Ok);

    const expectedAmendmentIds = [aDraftPortalAmendment.amendmentId.toString(), aReadyForCheckersApprovalPortalAmendment.amendmentId.toString()];
    expect(body.map((amendment) => amendment.amendmentId)).toEqual(expectedAmendmentIds);
  });
});
