import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { PORTAL_AMENDMENT_STATUS, PortalAmendmentStatus, TestApiError } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { GetAllPortalAmendmentsRequest, getAllPortalAmendments } from './get-all-amendments.controller';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';

const { DRAFT, ACKNOWLEDGED, READY_FOR_CHECKERS_APPROVAL, FURTHER_MAKERS_INPUT_REQUIRED } = PORTAL_AMENDMENT_STATUS;

const mockStatuses = [READY_FOR_CHECKERS_APPROVAL, FURTHER_MAKERS_INPUT_REQUIRED];

const aDraftPortalAmendment = aPortalFacilityAmendment({ status: DRAFT });
const aReadyForApprovalPortalAmendment = aPortalFacilityAmendment({ status: READY_FOR_CHECKERS_APPROVAL });
const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: ACKNOWLEDGED });
const mockReturnedAllPortalAmendments = [aDraftPortalAmendment, aReadyForApprovalPortalAmendment, anAcknowledgedPortalAmendment];

const mockFindAllPortalAmendmentsByStatus = jest.fn();

const generateHttpMocks = ({ statuses }: { statuses?: PortalAmendmentStatus[] } = {}) => createMocks<GetAllPortalAmendmentsRequest>({ query: { statuses } });

describe('getAllPortalAmendments', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'findAllPortalAmendmentsByStatus').mockImplementation(mockFindAllPortalAmendmentsByStatus);
    mockFindAllPortalAmendmentsByStatus.mockResolvedValue(mockReturnedAllPortalAmendments);
  });

  it('should call TfmFacilitiesRepo.findAllPortalAmendmentsByStatus with the correct params when no statuses are passed in the body', async () => {
    // Arrange
    const { req, res } = generateHttpMocks();

    // Act
    await getAllPortalAmendments(req, res);

    // Assert
    expect(mockFindAllPortalAmendmentsByStatus).toHaveBeenCalledTimes(1);
  });

  it('should call TfmFacilitiesRepo.findAllPortalAmendmentsByStatus with the correct params when statuses are passed in the body', async () => {
    // Arrange
    const { req, res } = generateHttpMocks({ statuses: mockStatuses });

    // Act
    await getAllPortalAmendments(req, res);

    // Assert
    expect(mockFindAllPortalAmendmentsByStatus).toHaveBeenCalledTimes(1);
    expect(mockFindAllPortalAmendmentsByStatus).toHaveBeenCalledWith({
      statuses: mockStatuses,
    });
  });

  it(`should return ${HttpStatusCode.Ok} and all the amendments for all facilities`, async () => {
    // Arrange
    const { req, res } = generateHttpMocks();

    // Act
    await getAllPortalAmendments(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getData()).toEqual(mockReturnedAllPortalAmendments);
  });

  it('should return the correct status and body if TfmFacilitiesRepo.findAllPortalAmendmentsByStatus throws an api error', async () => {
    // Arrange
    const status = HttpStatusCode.Forbidden;
    const message = 'Test error message';
    mockFindAllPortalAmendmentsByStatus.mockRejectedValue(new TestApiError({ status, message }));

    const { req, res } = generateHttpMocks();

    // Act
    await getAllPortalAmendments(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(status);
    expect(res._getData()).toEqual({
      status,
      message,
    });
  });

  it(`should return ${HttpStatusCode.InternalServerError} if TfmFacilitiesRepo.findAllPortalAmendmentsByStatus throws an unknown error`, async () => {
    // Arrange
    const message = 'Test error message';
    mockFindAllPortalAmendmentsByStatus.mockRejectedValue(new Error(message));

    const { req, res } = generateHttpMocks();

    // Act
    await getAllPortalAmendments(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    expect(res._getData()).toEqual({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when getting all portal facility amendments',
    });
  });
});
