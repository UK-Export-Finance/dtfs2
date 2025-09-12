import { TestApiError } from '@ukef/dtfs2-common/test-helpers';
import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import {
  getLatestAmendmentFacilityValueAndCoverEndDate,
  GetLatestAmendmentValueAndCoverEndDateByFacilityIdRequest,
} from './get-latest-amendment-facility-value-and-cover-end-date.controller';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';

const facilityId = 'facilityId';

const { ACKNOWLEDGED } = PORTAL_AMENDMENT_STATUS;

const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: ACKNOWLEDGED });
const mockReturnedPortalAmendments = [anAcknowledgedPortalAmendment];

const mockFindLatestValueAmendmentByFacilityId = jest.fn();
const mockFindLatestCoverEndDateAmendmentByFacilityId = jest.fn();

const generateHttpMocks = () => createMocks<GetLatestAmendmentValueAndCoverEndDateByFacilityIdRequest>({ params: { facilityId } });

describe('getLatestAmendmentFacilityValueAndCoverEndDate', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'findLatestValueAmendmentByFacilityId').mockImplementation(mockFindLatestValueAmendmentByFacilityId);
    jest.spyOn(TfmFacilitiesRepo, 'findLatestCoverEndDateAmendmentByFacilityId').mockImplementation(mockFindLatestCoverEndDateAmendmentByFacilityId);

    mockFindLatestValueAmendmentByFacilityId.mockResolvedValue(mockReturnedPortalAmendments[0]);
    mockFindLatestCoverEndDateAmendmentByFacilityId.mockResolvedValue(mockReturnedPortalAmendments[0]);
  });

  it('should call TfmFacilitiesRepo.findLatestValueAmendmentByFacilityId and TfmFacilitiesRepo.findLatestCoverEndDateAmendmentByFacilityId with the correct params', async () => {
    // Arrange
    const { req, res } = generateHttpMocks();

    // Act
    await getLatestAmendmentFacilityValueAndCoverEndDate(req, res);

    // Assert
    expect(mockFindLatestValueAmendmentByFacilityId).toHaveBeenCalledTimes(1);
    expect(mockFindLatestCoverEndDateAmendmentByFacilityId).toHaveBeenCalledTimes(1);
  });

  describe('when both value and cover end date amendments are found', () => {
    it('should return the correct status and body', async () => {
      mockFindLatestValueAmendmentByFacilityId.mockResolvedValue(mockReturnedPortalAmendments[0]);
      mockFindLatestCoverEndDateAmendmentByFacilityId.mockResolvedValue(mockReturnedPortalAmendments[0]);

      // Arrange
      const { req, res } = generateHttpMocks();

      // Act
      await getLatestAmendmentFacilityValueAndCoverEndDate(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual({
        value: mockReturnedPortalAmendments[0].value,
        coverEndDate: mockReturnedPortalAmendments[0].coverEndDate,
      });
    });
  });

  describe('when both only value amendments are found', () => {
    it('should return the correct status and body', async () => {
      mockFindLatestValueAmendmentByFacilityId.mockResolvedValue(mockReturnedPortalAmendments[0]);
      mockFindLatestCoverEndDateAmendmentByFacilityId.mockResolvedValue(null);

      // Arrange
      const { req, res } = generateHttpMocks();

      // Act
      await getLatestAmendmentFacilityValueAndCoverEndDate(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual({
        value: mockReturnedPortalAmendments[0].value,
        coverEndDate: null,
      });
    });
  });

  describe('when both only cover end date amendments are found', () => {
    it('should return the correct status and body', async () => {
      mockFindLatestValueAmendmentByFacilityId.mockResolvedValue(null);
      mockFindLatestCoverEndDateAmendmentByFacilityId.mockResolvedValue(mockReturnedPortalAmendments[0]);

      // Arrange
      const { req, res } = generateHttpMocks();

      // Act
      await getLatestAmendmentFacilityValueAndCoverEndDate(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual({
        value: null,
        coverEndDate: mockReturnedPortalAmendments[0].coverEndDate,
      });
    });
  });

  describe('when no amendments are found', () => {
    it('should return the correct status and body', async () => {
      mockFindLatestValueAmendmentByFacilityId.mockResolvedValue(null);
      mockFindLatestCoverEndDateAmendmentByFacilityId.mockResolvedValue(null);

      // Arrange
      const { req, res } = generateHttpMocks();

      // Act
      await getLatestAmendmentFacilityValueAndCoverEndDate(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual({
        value: null,
        coverEndDate: null,
      });
    });
  });

  it('should return the correct status and body if TfmFacilitiesRepo.findLatestValueAmendmentByFacilityId throws an api error', async () => {
    // Arrange
    const status = HttpStatusCode.Forbidden;
    const message = 'Test error message';
    mockFindLatestValueAmendmentByFacilityId.mockRejectedValue(new TestApiError({ status, message }));

    const { req, res } = generateHttpMocks();

    // Act
    await getLatestAmendmentFacilityValueAndCoverEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(status);
    expect(res._getData()).toEqual({
      status,
      message,
    });
  });

  it(`should return ${HttpStatusCode.InternalServerError} if TfmFacilitiesRepo.mockFindLatestValueAmendmentByFacilityId throws an unknown error`, async () => {
    // Arrange
    const message = 'Test error message';
    mockFindLatestValueAmendmentByFacilityId.mockRejectedValue(new Error(message));

    const { req, res } = generateHttpMocks();

    // Act
    await getLatestAmendmentFacilityValueAndCoverEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    expect(res._getData()).toEqual({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when getting latest value and cover end date amendments by facilityId',
    });
  });

  it('should return the correct status and body if TfmFacilitiesRepo.findLatestCoverEndDateAmendmentByFacilityId throws an api error', async () => {
    // Arrange
    const status = HttpStatusCode.Forbidden;
    const message = 'Test error message';
    mockFindLatestCoverEndDateAmendmentByFacilityId.mockRejectedValue(new TestApiError({ status, message }));

    const { req, res } = generateHttpMocks();

    // Act
    await getLatestAmendmentFacilityValueAndCoverEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(status);
    expect(res._getData()).toEqual({
      status,
      message,
    });
  });

  it(`should return ${HttpStatusCode.InternalServerError} if TfmFacilitiesRepo.findLatestCoverEndDateAmendmentByFacilityId throws an unknown error`, async () => {
    // Arrange
    const message = 'Test error message';
    mockFindLatestCoverEndDateAmendmentByFacilityId.mockRejectedValue(new Error(message));

    const { req, res } = generateHttpMocks();

    // Act
    await getLatestAmendmentFacilityValueAndCoverEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    expect(res._getData()).toEqual({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when getting latest value and cover end date amendments by facilityId',
    });
  });
});
