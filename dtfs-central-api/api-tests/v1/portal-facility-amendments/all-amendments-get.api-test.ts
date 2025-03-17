import { Response } from 'supertest';
import { HttpStatusCode } from 'axios';
import { MONGO_DB_COLLECTIONS, PORTAL_AMENDMENT_STATUS, PortalAmendmentStatus, PortalFacilityAmendment, TfmFacility, TestApiError } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { ObjectId } from 'mongodb';
import wipeDB from '../../wipeDB';
import { testApi } from '../../test-api';
import { mongoDbClient as db } from '../../../src/drivers/db-client';
import { aCompletedTfmFacilityAmendment, aTfmFacility, aTfmFacilityAmendment } from '../../../test-helpers';
import { TfmFacilitiesRepo } from '../../../src/repositories/tfm-facilities-repo';

console.error = jest.fn();
interface PortalAmendmentsResponse extends Response {
  body: PortalFacilityAmendment[];
}

const { DRAFT, ACKNOWLEDGED, READY_FOR_CHECKERS_APPROVAL, FURTHER_MAKERS_INPUT_REQUIRED } = PORTAL_AMENDMENT_STATUS;

const generateUrl = ({ statuses }: { statuses?: PortalAmendmentStatus[] }): string => {
  const getStatusesParameter = (statusesParam?: PortalAmendmentStatus[]) => statusesParam?.map((item) => encodeURI(item)).join(',');
  const statusFilterQuery = statuses ? `?statuses=${getStatusesParameter(statuses)}` : '';
  return `/v1/portal/facilities/amendments${statusFilterQuery}`;
};

describe('GET /v1/portal/deals/amendments', () => {
  const dealId = new ObjectId().toString();

  const aDraftPortalAmendment = aPortalFacilityAmendment({ status: DRAFT });
  const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: ACKNOWLEDGED });
  const aReadyForCheckersApprovalPortalAmendment = aPortalFacilityAmendment({ status: READY_FOR_CHECKERS_APPROVAL });
  const aFurtherMakersInputRequiredPortalAmendment = aPortalFacilityAmendment({ status: FURTHER_MAKERS_INPUT_REQUIRED });

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

  it(`should return an empty array when there are no portal amendments`, async () => {
    // Arrange
    await db.getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES).then((collection) => collection.insertMany([facilityWithNoAmendments]));

    // Assert
    const { status, body } = (await testApi.get(generateUrl({}))) as PortalAmendmentsResponse;

    // Act
    expect(status).toEqual(HttpStatusCode.Ok);
    expect(body).toEqual([]);
  });

  it(`should return an empty array when there are no portal amendments with the requested statuses`, async () => {
    // Arrange
    await db
      .getCollection(MONGO_DB_COLLECTIONS.TFM_FACILITIES)
      .then((collection) =>
        collection.insertMany([facilityWithATfmAmendment, facilityWithReadyForCheckersApprovalAndTfmAmendments, facilityWithDraftAndAcknowledgedAmendments]),
      );

    // Assert
    const { status, body } = (await testApi.get(generateUrl({ statuses: [FURTHER_MAKERS_INPUT_REQUIRED] }))) as PortalAmendmentsResponse;

    // Act
    expect(status).toEqual(HttpStatusCode.Ok);
    expect(body).toEqual([]);
  });

  it(`should return all the portal amendments when no statuses are provided`, async () => {
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
    const { status, body } = (await testApi.get(generateUrl({}))) as PortalAmendmentsResponse;

    // Act
    expect(status).toEqual(HttpStatusCode.Ok);

    const expectedAmendmentIds = [
      aDraftPortalAmendment.amendmentId.toString(),
      anAcknowledgedPortalAmendment.amendmentId.toString(),
      aReadyForCheckersApprovalPortalAmendment.amendmentId.toString(),
      aDraftPortalAmendment.amendmentId.toString(),
      aFurtherMakersInputRequiredPortalAmendment.amendmentId.toString(),
    ];
    expect(body.map((amendment) => amendment.amendmentId)).toEqual(expectedAmendmentIds);
  });

  it(`should return all the portal amendments matching the provided statuses`, async () => {
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
    const { status, body } = (await testApi.get(generateUrl({ statuses: [DRAFT, READY_FOR_CHECKERS_APPROVAL] }))) as PortalAmendmentsResponse;

    // Act
    expect(status).toEqual(HttpStatusCode.Ok);

    const expectedAmendmentIds = [
      aDraftPortalAmendment.amendmentId.toString(),
      aReadyForCheckersApprovalPortalAmendment.amendmentId.toString(),
      aDraftPortalAmendment.amendmentId.toString(),
    ];
    expect(body.map((amendment) => amendment.amendmentId)).toEqual(expectedAmendmentIds);
  });

  it(`should return ${HttpStatusCode.InternalServerError} if it throws an unknown error`, async () => {
    const errorStatus = HttpStatusCode.InternalServerError;
    jest.spyOn(TfmFacilitiesRepo, 'findAllPortalAmendmentsByStatus').mockImplementation(() => {
      throw new TestApiError({ status: errorStatus });
    });

    // Assert
    const { status } = (await testApi.get(generateUrl({ statuses: [DRAFT, READY_FOR_CHECKERS_APPROVAL] }))) as PortalAmendmentsResponse;

    // Act
    expect(status).toEqual(HttpStatusCode.InternalServerError);
  });
});
