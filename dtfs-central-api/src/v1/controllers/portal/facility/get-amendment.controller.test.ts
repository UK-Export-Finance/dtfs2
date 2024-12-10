import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { AMENDMENT_TYPES, FacilityAmendmentWithUkefId, TestApiError } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';
import { getAmendment, GetAmendmentRequest } from './get-amendment.controller';

const mockFindOneAmendmentByFacilityIdAndAmendmentId = jest.fn() as jest.Mock<Promise<FacilityAmendmentWithUkefId | undefined>>;

const facilityId = new ObjectId().toString();
const amendmentId = new ObjectId().toString();

describe('getAmendment', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'findOneAmendmentByFacilityIdAndAmendmentId').mockImplementation(mockFindOneAmendmentByFacilityIdAndAmendmentId);
  });

  it('should call TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId with the facility and amendment id', async () => {
    // Arrange
    const { req, res } = httpMocks.createMocks<GetAmendmentRequest>({ params: { facilityId, amendmentId } });

    // Act
    await getAmendment(req, res);

    // Assert
    expect(mockFindOneAmendmentByFacilityIdAndAmendmentId).toHaveBeenCalledTimes(1);
    expect(mockFindOneAmendmentByFacilityIdAndAmendmentId).toHaveBeenCalledWith(facilityId, amendmentId);
  });

  it(`should set the status to ${HttpStatusCode.NotFound} if the amendment is undefined`, async () => {
    // Arrange
    mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValue(undefined);

    const { req, res } = httpMocks.createMocks<GetAmendmentRequest>({ params: { facilityId, amendmentId } });

    // Act
    await getAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
  });

  it(`should set the status to ${HttpStatusCode.NotFound} if the amendment is of type ${AMENDMENT_TYPES.TFM}`, async () => {
    // Arrange
    const amendment = { amendmentId: new ObjectId(), type: AMENDMENT_TYPES.TFM, ukefFacilityId: 'ukefFacilityId' } as FacilityAmendmentWithUkefId;
    mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValue(amendment);

    const { req, res } = httpMocks.createMocks<GetAmendmentRequest>({ params: { facilityId, amendmentId } });

    // Act
    await getAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
  });

  it(`should set the status to ${HttpStatusCode.NotFound} if the amendment type is undefined`, async () => {
    // Arrange
    const amendment = { amendmentId: new ObjectId(), ukefFacilityId: 'ukefFacilityId' } as FacilityAmendmentWithUkefId;
    mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValue(amendment);

    const { req, res } = httpMocks.createMocks<GetAmendmentRequest>({ params: { facilityId, amendmentId } });

    // Act
    await getAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
  });

  it(`should set the status to ${HttpStatusCode.Ok} if the amendment is of type ${AMENDMENT_TYPES.PORTAL}`, async () => {
    // Arrange
    const amendment = { amendmentId: new ObjectId(), type: AMENDMENT_TYPES.PORTAL, ukefFacilityId: 'ukefFacilityId' } as FacilityAmendmentWithUkefId;
    mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValue(amendment);

    const { req, res } = httpMocks.createMocks<GetAmendmentRequest>({ params: { facilityId, amendmentId } });

    // Act
    await getAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
  });

  it(`should return the amendment if the amendment is of type ${AMENDMENT_TYPES.PORTAL}`, async () => {
    // Arrange
    const amendment = { amendmentId: new ObjectId(), type: AMENDMENT_TYPES.PORTAL, ukefFacilityId: 'ukefFacilityId' } as FacilityAmendmentWithUkefId;
    mockFindOneAmendmentByFacilityIdAndAmendmentId.mockResolvedValue(amendment);

    const { req, res } = httpMocks.createMocks<GetAmendmentRequest>({ params: { facilityId, amendmentId } });

    // Act
    await getAmendment(req, res);

    // Assert
    expect(res._getData()).toEqual(amendment);
  });

  it(`should return the correct status & body if TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId throws an ApiError`, async () => {
    // Arrange
    const testErrorStatus = HttpStatusCode.Forbidden;
    const testErrorMessage = 'An error';
    mockFindOneAmendmentByFacilityIdAndAmendmentId.mockRejectedValue(new TestApiError(testErrorStatus, testErrorMessage));

    const { req, res } = httpMocks.createMocks<GetAmendmentRequest>({ params: { facilityId, amendmentId } });

    // Act
    await getAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(testErrorStatus);
    expect(res._getData()).toEqual({ status: testErrorStatus, message: testErrorMessage });
  });

  it(`should return status ${HttpStatusCode.InternalServerError} & correct body if TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId throws an unknown Error`, async () => {
    // Arrange
    mockFindOneAmendmentByFacilityIdAndAmendmentId.mockRejectedValue(new Error());

    const { req, res } = httpMocks.createMocks<GetAmendmentRequest>({ params: { facilityId, amendmentId } });

    // Act
    await getAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    expect(res._getData()).toEqual({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when getting amendment',
    });
  });
});
