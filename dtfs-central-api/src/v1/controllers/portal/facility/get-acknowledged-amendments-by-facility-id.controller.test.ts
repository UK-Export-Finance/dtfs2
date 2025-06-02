import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { PORTAL_AMENDMENT_STATUS, PortalAmendmentStatus, TestApiError } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendment } from '@ukef/dtfs2-common/mock-data-backend';
import { getAcknowledgedAmendmentsByFacilityId, GetAcknowledgedAmendmentsByFacilityIdRequest } from './get-acknowledged-amendments-by-facility-id.controller';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';

const { ACKNOWLEDGED } = PORTAL_AMENDMENT_STATUS;

const anAcknowledgedPortalAmendment = aPortalFacilityAmendment({ status: ACKNOWLEDGED });
const mockReturnedPortalAmendments = [anAcknowledgedPortalAmendment];

const mockGetAcknowledgedAmendmentsByFacilityId = jest.fn();

const generateHttpMocks = ({ statuses }: { statuses?: PortalAmendmentStatus[] } = {}) =>
  createMocks<GetAcknowledgedAmendmentsByFacilityIdRequest>({ query: { statuses } });

describe('getAcknowledgedAmendmentsByFacilityId', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(TfmFacilitiesRepo, 'findAcknowledgedPortalAmendmentsByFacilityId').mockImplementation(mockGetAcknowledgedAmendmentsByFacilityId);
    mockGetAcknowledgedAmendmentsByFacilityId.mockResolvedValue(mockReturnedPortalAmendments);
  });

  it('should call TfmFacilitiesRepo.findAcknowledgedPortalAmendmentsByFacilityId with the correct params', async () => {
    // Arrange
    const { req, res } = generateHttpMocks();

    // Act
    await getAcknowledgedAmendmentsByFacilityId(req, res);

    // Assert
    expect(mockGetAcknowledgedAmendmentsByFacilityId).toHaveBeenCalledTimes(1);
  });

  it(`should return ${HttpStatusCode.Ok} and all the amendments on the facility`, async () => {
    // Arrange
    const { req, res } = generateHttpMocks();

    // Act
    await getAcknowledgedAmendmentsByFacilityId(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getData()).toEqual(mockReturnedPortalAmendments);
  });

  it('should return the correct status and body if TfmFacilitiesRepo.findAcknowledgedPortalAmendmentsByFacilityId throws an api error', async () => {
    // Arrange
    const status = HttpStatusCode.Forbidden;
    const message = 'Test error message';
    mockGetAcknowledgedAmendmentsByFacilityId.mockRejectedValue(new TestApiError({ status, message }));

    const { req, res } = generateHttpMocks();

    // Act
    await getAcknowledgedAmendmentsByFacilityId(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(status);
    expect(res._getData()).toEqual({
      status,
      message,
    });
  });

  it(`should return ${HttpStatusCode.InternalServerError} if TfmFacilitiesRepo.findAcknowledgedPortalAmendmentsByFacilityId throws an unknown error`, async () => {
    // Arrange
    const message = 'Test error message';
    mockGetAcknowledgedAmendmentsByFacilityId.mockRejectedValue(new Error(message));

    const { req, res } = generateHttpMocks();

    // Act
    await getAcknowledgedAmendmentsByFacilityId(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    expect(res._getData()).toEqual({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when getting acknowledged amendments by facilityId',
    });
  });
});
